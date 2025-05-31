import {
  SGroupProfile,
  SSimpleGroupInfo,
  TGroupProfile,
  TSimpleGroupInfo,
  TUser,
} from '@repo/be-core';
import { TypeormUser } from '../../infrastructure/persistence/typeorm/entity/user/typeorm-user.entity';

// export class UserMapper {
//   public static async toDomainEntity(
//     payload: ToDomainPayloadType
//   ): Promise<ToDomainReturnType> {
//     const results: User[] = [];
//     const errors: Error[] = [];

//     const { elements } = payload;

//     const promiseList = elements.map(async (item) => {
//       const {
//         user,
//         groups,
//         ownGroups,
//         userGroupProfiles: userGroupProfile,
//         invitedGroupsElements: invitedGroups,
//       } = item;

//       const invitedGroupInfoList: GroupInfo[] = invitedGroups.map(
//         (invitedGroupElement) => {
//           const { group, memberProfiles, owner } = invitedGroupElement;
//           const ownerNickname: string =
//             memberProfiles.filter(
//               (profile) => profile.userId === group.ownerId
//             )[0]?.nickname ||
//             owner.username ||
//             ''; // TODO: username이 nullable로 바뀌면서 수정 필요

//           return new GroupInfo({
//             groupId: group.id,
//             name: group.name,
//             ownerId: group.ownerId,
//             ownerNickname,
//           });
//         }
//       );

//       const userPayload: CreateUserEntityPayload<'existing'> = {
//         username: user.username || '', // TODO: username이 nullable로 바뀌면서 수정 필요
//         email: user.email,
//         hasProfileImage: user.hasProfileImage,

//         groups: groups.map((group) => group.id),
//         ownGroups: ownGroups.map((group) => group.id),
//         userGroupProfiles: userGroupProfile.map((profile) => {
//           return new UserGroupProfile({
//             groupId: profile.groupId,
//             nickname: profile.nickname,
//             hasProfileImage: profile.hasProfileImage,
//           });
//         }),
//         invitedGroupList: invitedGroupInfoList,

//         id: user.id,
//         createdDateTime: user.createdDateTime,
//         updatedDateTime: user.updatedDateTime,
//         deletedDateTime: user.deletedDateTime,
//       };
//       return User.new(userPayload);
//     });

//     await Promise.allSettled(promiseList).then((promiseResults) => {
//       promiseResults.forEach((result) => {
//         if (result.status === 'fulfilled') {
//           results.push(result.value);
//         } else {
//           errors.push(result.reason);
//         }
//       });
//     });
//     return { results, errors };
//   }

//   public static toOrmEntity(payload: User[]): ToOrmReturnType {
//     const ret = payload.map((item) => {
//       const typeormUser = new TypeormUser();
//       typeormUser.id = item.id;
//       typeormUser.username = item.username;
//       typeormUser.email = item.email;

//       typeormUser.hasProfileImage = item.hasProfile;

//       typeormUser.createdDateTime = item.createdDateTime;
//       typeormUser.updatedDateTime = item.updatedDateTime;
//       typeormUser.deletedDateTime = item.deletedDateTime;

//       const groupsWithProfile = item.userGroupProfiles.map((profile) => {
//         const typeormProfile = new TypeormUserGroupProfile();
//         typeormProfile.userId = item.id;
//         typeormProfile.groupId = profile.groupId;
//         typeormProfile.nickname = profile.nickname;
//         typeormProfile.hasProfileImage = profile.hasProfileImage;
//         return typeormProfile;
//       });

//       return { user: typeormUser, userGroupProfile: groupsWithProfile };
//     });

//     return ret;
//   }
// }

export class GroupProfileMapper {
  public static toDomainEntity(payload: TGroupProfile): TGroupProfile {
    const result = SGroupProfile.parse(payload);
    return result;
  }
}

export class SimpleGroupInfoMapper {
  public static toDomainEntity(payload: TSimpleGroupInfo): TSimpleGroupInfo {
    const result = SSimpleGroupInfo.parse(payload);
    return result;
  }
}

export class UserMapper {
  public static toDomainEntity(payload: TypeormUser): TUser {
    const {
      id,
      username,
      email,
      profileImageUrl,
      createdDateTime,
      updatedDateTime,
      deletedDateTime,
    } = payload;

    if (!username) {
      throw new Error('user who username is not set is not allowed');
    }

    const user: TUser = {
      id,
      username: username,
      email,
      profileImageUrl,
      groups: [],
      ownGroups: [],
      groupProfiles: [],
      invitedGroupList: [],
      createdDateTime,
      updatedDateTime,
      deletedDateTime,
    };

    return user;
  }

  public static toDomainEntityList(payload: TypeormUser[]): TUser[] {
    return payload.map((item) => this.toDomainEntity(item));
  }
}
