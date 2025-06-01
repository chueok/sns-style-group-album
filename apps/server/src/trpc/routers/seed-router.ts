import { z } from 'zod';
import { authProcedure, publicProcedure, router } from '../trpc';
import { setSecureCookie } from '../../auth/utils';
import { AuthModuleConfig } from '../../auth/config';
import { createSeedInnerContext } from '../inner-context';
import { TypeormUser } from '../../infrastructure/persistence/typeorm/entity/user/typeorm-user.entity';
import { IsNull } from 'typeorm';
import { TypeormOauth } from '../../infrastructure/persistence/typeorm/entity/oauth/typeorm-oauth.entity';
import { GroupId, UserId } from '@repo/be-core';
import { TypeormGroup } from '../../infrastructure/persistence/typeorm/entity/group/typeorm-group.entity';

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
      } = ctx;

      const { provider, providerId } = input;

      await authService.loginOrSignup({
        provider: provider || 'google',
        providerId: providerId || generateRandomNumber(),
      });
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

      await groupService.createGroup(user.id, name || generateRandomString());
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

      if (!rawGroup) {
        throw new Error('Group not found');
      }

      await groupService.changeGroupName({
        requesterId: rawGroup.ownerId,
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

      if (!rawGroup) {
        throw new Error('Group not found');
      }

      await groupService.deleteGroup({
        requesterId: rawGroup.ownerId,
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
        },
        select: {
          id: true,
          name: true,
          owner: {
            id: true,
            username: true,
            profileImageUrl: true,
          },
        },
        relations: {
          owner: true,
        },
      });

      return groups.map((group) => ({
        id: group.id,
        name: group.name,
        ownerName: group.__owner__?.username || '',
      }));
    }),

  addGroupMember: publicProcedure
    .input(
      z.object({
        groupId: z.string(),
        memberIdList: z.string().array(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { dataSource } = getSeedContext(ctx);
      const { groupId, memberIdList } = input;

      // domain 로직에서는 직접적으로 멤버를 추가하지 않고,
      // 조인 요청을 보낸 멤버에 대해 승인하는 방식으로 되어있음.
      // 따라서 seed 에서는 직접 db에 접근하여 추가하도록 구현하였음.
      const groupRepository = dataSource.getRepository(TypeormGroup);
      await groupRepository
        .createQueryBuilder('group')
        .relation('members')
        .of(groupId)
        .add(memberIdList);
    }),

  getGroupMembers: publicProcedure
    .input(z.object({ groupId: z.string() }))
    .output(
      z
        .object({
          id: z.string(),
          username: z.string(),
          profileImageUrl: z.string().nullable(),
        })
        .array()
    )
    .query(async ({ input, ctx }) => {
      const {
        group: { groupRepository },
      } = ctx;

      const group = await groupRepository.findMembers(input.groupId);
      return group.items.map((member) => ({
        id: member.userId,
        username: member.username,
        profileImageUrl: member.profileImageUrl,
      }));
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
