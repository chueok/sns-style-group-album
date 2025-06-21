import { z } from 'zod';
import { authProcedure, publicProcedure, router } from '../trpc';
import { setSecureCookie } from '../../auth/utils';
import { AuthModuleConfig } from '../../auth/config';
import { createSeedInnerContext } from '../inner-context';
import { TypeormUser } from '../../infrastructure/persistence/typeorm/entity/user/typeorm-user.entity';
import { In, IsNull } from 'typeorm';
import { TypeormOauth } from '../../infrastructure/persistence/typeorm/entity/oauth/typeorm-oauth.entity';
import { EContentCategory, GroupId, UserId } from '@repo/be-core';
import { TypeormGroup } from '../../infrastructure/persistence/typeorm/entity/group/typeorm-group.entity';
import { v4, v6 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { ServerConfig } from '../../config/server-config';
import { TypeormMedia } from '../../infrastructure/persistence/typeorm/entity/content/typeorm-content.entity';
import { TypeormMember } from '../../infrastructure/persistence/typeorm/entity/group/typeorm-member.entity';

const getSeedContext = (ctx): ReturnType<typeof createSeedInnerContext> => {
  return ctx.seed;
};

export const seedRouter = router({
  /*************************
   * 개발용 유저 관리
   ***********************/
  login: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const {
        auth: { authService },
        res,
      } = ctx;
      const { dataSource } = getSeedContext(ctx);

      const oauthUser = await dataSource.getRepository(TypeormOauth).findOne({
        where: {
          userId: input.userId as UserId,
        },
      });
      if (!oauthUser) {
        throw new Error('OAuth user not found');
      }

      const { provider, providerId } = oauthUser;

      const { accessToken, refreshToken } = await authService.loginOrSignup({
        provider,
        providerId,
      });

      setSecureCookie({
        res,
        name: AuthModuleConfig.AccessTokenCookieName,
        val: accessToken,
        cookieOptions: {
          maxAge: AuthModuleConfig.AccessTokenMaxAgeInCookie,
        },
      });

      setSecureCookie({
        res,
        name: AuthModuleConfig.RefreshTokenCookieName,
        val: refreshToken,
        cookieOptions: {
          maxAge: AuthModuleConfig.RefreshTokenMaxAgeInCookie,
        },
      });
    }),

  createUser: publicProcedure
    .input(
      z.object({
        provider: z.string().optional(),
        providerId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const {
        auth: { authService },
        res,
      } = ctx;

      const { dataSource } = getSeedContext(ctx);

      const { provider, providerId: providerIdInput } = input;

      const providerId = providerIdInput || generateRandomNumber();
      const { accessToken, refreshToken } = await authService.loginOrSignup({
        provider: provider || 'google',
        providerId,
      });

      setSecureCookie({
        res,
        name: AuthModuleConfig.AccessTokenCookieName,
        val: accessToken,
        cookieOptions: {
          maxAge: AuthModuleConfig.AccessTokenMaxAgeInCookie,
        },
      });

      setSecureCookie({
        res,
        name: AuthModuleConfig.RefreshTokenCookieName,
        val: refreshToken,
        cookieOptions: {
          maxAge: AuthModuleConfig.RefreshTokenMaxAgeInCookie,
        },
      });

      const userRepository = dataSource.getRepository(TypeormUser);
      const user = await userRepository.findOne({
        relations: {
          oauths: true,
        },
        where: {
          oauths: {
            provider: 'google',
            providerId,
          },
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        id: user.id,
      };
    }),

  changeUsername: publicProcedure
    .input(z.object({ id: z.string(), username: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id, username } = input;
      const {
        userDomain: { userService },
      } = ctx;
      await userService.editDefaultProfile({
        userId: id,
        username: username || generateRandomString(),
      });
    }),

  deleteUser: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const {
        userDomain: { userService },
      } = ctx;
      const { id } = input;
      await userService.deleteUser(id);
    }),

  getUsers: publicProcedure
    .output(
      z
        .object({
          id: z.string(),
          username: z.string().nullable(),
          profileImageUrl: z.string().nullable(),
          createdDateTime: z.date(),
          updatedDateTime: z.date().nullable(),
          deletedDateTime: z.date().nullable(),
        })
        .array()
    )
    .query(async ({ ctx }) => {
      const { dataSource } = getSeedContext(ctx);
      const userRepository = dataSource.getRepository(TypeormUser);
      const users = await userRepository.find({
        where: {
          deletedDateTime: IsNull(),
        },
        select: {
          id: true,
          username: true,
          profileImageUrl: true,
          createdDateTime: true,
          updatedDateTime: true,
          deletedDateTime: true,
        },
      });
      return users.map((user) => ({
        id: user.id,
        username: user.username,
        profileImageUrl: user.profileImageUrl,
        createdDateTime: user.createdDateTime,
        updatedDateTime: user.updatedDateTime,
        deletedDateTime: user.deletedDateTime,
      }));
    }),

  /*************************
   * 개발용 그룹 관리
   ***********************/
  createGroup: authProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const {
        group: { groupService },
        user,
      } = ctx;
      const { name } = input;

      const newGroup = await groupService.createGroup(
        user.id,
        name || generateRandomString()
      );
      return { id: newGroup.id };
    }),

  changeGroupName: publicProcedure
    .input(z.object({ groupId: z.string(), name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { groupId, name } = input;
      const {
        group: { groupService },
      } = ctx;

      const { dataSource } = getSeedContext(ctx);
      const groupRepository = dataSource.getRepository(TypeormGroup);
      const rawGroup = await groupRepository.findOne({
        where: {
          id: groupId as GroupId,
        },
      });

      const groupOwner = await dataSource.getRepository(TypeormMember).findOne({
        where: {
          groupId: groupId as GroupId,
          role: 'owner',
        },
      });

      if (!rawGroup) {
        throw new Error('Group not found');
      }
      if (!groupOwner) {
        throw new Error('Group owner not found');
      }

      await groupService.changeGroupName({
        requesterId: groupOwner.userId,
        groupId,
        name: name || generateRandomString(),
      });
    }),

  deleteGroup: publicProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { groupId } = input;
      const {
        group: { groupService },
      } = ctx;
      const { dataSource } = getSeedContext(ctx);
      const groupRepository = dataSource.getRepository(TypeormGroup);
      const rawGroup = await groupRepository.findOne({
        where: {
          id: groupId as GroupId,
        },
      });

      const groupOwner = await dataSource.getRepository(TypeormMember).findOne({
        where: {
          groupId: groupId as GroupId,
          role: 'owner',
        },
      });

      if (!rawGroup) {
        throw new Error('Group not found');
      }

      if (!groupOwner) {
        throw new Error('Group owner not found');
      }

      await groupService.deleteGroup({
        requesterId: groupOwner.userId,
        groupId,
      });
    }),

  getGroups: publicProcedure
    .output(
      z
        .object({
          id: z.string(),
          name: z.string(),
          ownerName: z.string(),
        })
        .array()
    )
    .query(async ({ ctx }) => {
      const { dataSource } = getSeedContext(ctx);
      const groupRepository = dataSource.getRepository(TypeormGroup);
      const groups = await groupRepository.find({
        where: {
          deletedDateTime: IsNull(),
          members: {
            role: 'owner',
          },
        },
        select: {
          id: true,
          name: true,
          members: {
            id: true,
            userId: true,
            username: true,
            profileImageUrl: true,
          },
        },
        relations: {
          members: true,
        },
      });

      return groups.flatMap((group) => {
        const owner = group.__members__?.at(0);
        if (!owner) {
          return [];
        }
        return {
          id: group.id,
          name: group.name,
          ownerName: owner.username,
        };
      });
    }),

  addGroupMember: publicProcedure
    .input(
      z.object({
        groupId: z.string(),
        userIdList: z.string().array(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { dataSource } = getSeedContext(ctx);
      const { groupId, userIdList } = input;

      // domain 로직에서는 직접적으로 멤버를 추가하지 않고,
      // 조인 요청을 보낸 멤버에 대해 승인하는 방식으로 되어있음.
      // 따라서 seed 에서는 직접 db에 접근하여 추가하도록 구현하였음.
      const users = await dataSource.getRepository(TypeormUser).find({
        where: {
          id: In(userIdList),
        },
      });

      const memberRepository = dataSource.getRepository(TypeormMember);
      const newMembers = users.map((user) => {
        return memberRepository.create({
          id: v6(),
          groupId: groupId as GroupId,
          userId: user.id,
          username: user.username || '',
          profileImageUrl: user.profileImageUrl,
          role: 'member',
          joinRequestDateTime: new Date(),
          joinDateTime: new Date(),
          status: 'approved',
        });
      });

      await memberRepository.save(newMembers);
    }),

  getGroupMembers: publicProcedure
    .input(z.object({ groupId: z.string() }))
    .output(
      z
        .object({
          userId: z.string(),
          memberId: z.string(),
          username: z.string(),
          profileImageUrl: z.string().optional(),
        })
        .array()
    )
    .query(async ({ input, ctx }) => {
      const { dataSource } = getSeedContext(ctx);
      const memberRepository = dataSource.getRepository(TypeormMember);
      const members = await memberRepository.find({
        where: {
          groupId: input.groupId as GroupId,
        },
      });

      return members.map((member) => ({
        userId: member.userId,
        memberId: member.id,
        username: member.username,
        profileImageUrl: member.profileImageUrl || undefined,
      }));
    }),

  // Next.js 에서 사용하기 위함 (web 에서는 사용하지 않음)
  generateSeedMedia: publicProcedure
    .input(
      z.object({
        groupId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { groupId, userId } = input;
      const {
        content: { contentRepository },
      } = ctx;
      const { dataSource, objectStorage } = getSeedContext(ctx);
      const mediaRepository = dataSource.getRepository(TypeormMedia);

      const memberId = await contentRepository.findMemberId({
        groupId,
        userId,
      });
      if (!memberId) {
        throw new Error('Member not found');
      }

      const filePaths = fs
        .readdirSync(path.join(process.cwd(), 'seed-data/random-img-1000'))
        .map((file) =>
          path.join(process.cwd(), 'seed-data/random-img-1000', file)
        );

      // 현재 시간으로부터 30일 전까지의 랜덤한 날짜 생성
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30일 전

      const dateList = filePaths
        .map(() => generateRandomDate(startDate, endDate))
        .sort((a, b) => a.getTime() - b.getTime()); // 오름차순 정렬

      let i = 0;
      for (const filePath of filePaths) {
        // 파일 정보 가져오기
        const stats = fs.statSync(filePath);
        const ext = path.extname(filePath).slice(1);
        const mimeType = getMimeType(ext);
        const category = mimeType.startsWith('image/')
          ? EContentCategory.IMAGE
          : EContentCategory.VIDEO;

        const fileName = v4();
        const originalRelativePath = `seed/${fileName}`;

        const newMedia = mediaRepository.create({
          id: v6(),
          category,
          originalRelativePath,
          size: stats.size,
          ext,
          mimeType,
          ownerId: memberId,
          groupId,
          createdDateTime: dateList[i],
        });

        await mediaRepository.save(newMedia);

        await objectStorage.uploadFile(
          ServerConfig.OBJECT_STORAGE_MEDIA_BUCKET,
          originalRelativePath,
          filePath
        );

        i++;
      }
    }),
});

const generateRandomNumber = () => {
  const randomCode = Math.floor(10000000 + Math.random() * 90000000).toString();
  return randomCode;
};

const generateRandomString = (length: number = 8) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// 특정 기간 내의 랜덤한 날짜를 생성하는 함수
const generateRandomDate = (startDate: Date, endDate: Date): Date => {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime);
};

// MIME 타입을 가져오는 헬퍼 함수
const getMimeType = (ext: string): string => {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
  };
  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
};
