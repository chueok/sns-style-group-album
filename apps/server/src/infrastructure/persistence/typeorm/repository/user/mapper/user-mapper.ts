import { CreateUserEntityPayload, User, UserGroupProfile } from "@repo/be-core";
import { TypeormUser } from "../../../entity/user/typeorm-user.entity";
import { TypeormGroup } from "../../../entity/group/typeorm-group.entity";
import { TypeormUserGroupProfile } from "../../../entity/user-group-profile/typeorm-user-group-profile.entity";

type ToDomainPayloadType = {
  elements: {
    user: TypeormUser;
    groups: TypeormGroup[];
    ownGroups: TypeormGroup[];
    userGroupProfiles: UserGroupProfile[];
    invitedGroupList: TypeormGroup[];
  }[];
};

type ToDomainReturnType = {
  results: User[];
  errors: Error[];
};

type ToOrmReturnType = {
  user: TypeormUser;
  userGroupProfile: UserGroupProfile[];
}[];

export class UserMapper {
  public static async toDomainEntity(
    payload: ToDomainPayloadType,
  ): Promise<ToDomainReturnType> {
    const results: User[] = [];
    const errors: Error[] = [];

    const { elements } = payload;

    const promiseList = elements.map(async (item) => {
      const {
        user,
        groups,
        ownGroups,
        userGroupProfiles: userGroupProfile,
        invitedGroupList,
      } = item;

      const userPayload: CreateUserEntityPayload<"existing"> = {
        username: user.username,
        email: user.email,
        hasProfileImage: user.hasProfileImage,

        groups: groups.map((group) => group.id),
        ownGroups: ownGroups.map((group) => group.id),
        userGroupProfiles: userGroupProfile.map((profile) => {
          return new UserGroupProfile({
            groupId: profile.groupId,
            nickname: profile.nickname,
            hasProfileImage: profile.hasProfileImage,
          });
        }),
        invitedGroupList: invitedGroupList.map((group) => group.id),

        id: user.id,
        createdDateTime: user.createdDateTime,
        updatedDateTime: user.updatedDateTime,
        deletedDateTime: user.deletedDateTime,
      };
      return User.new(userPayload);
    });

    await Promise.allSettled(promiseList).then((promiseResults) => {
      promiseResults.forEach((result) => {
        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          errors.push(result.reason);
        }
      });
    });
    return { results, errors };
  }

  public static toOrmEntity(payload: User[]): ToOrmReturnType {
    const ret = payload.map((item) => {
      const typeormUser = new TypeormUser();
      typeormUser.id = item.id;
      typeormUser.username = item.username;
      typeormUser.email = item.email;

      typeormUser.hasProfileImage = item.hasProfile;

      typeormUser.createdDateTime = item.createdDateTime;
      typeormUser.updatedDateTime = item.updatedDateTime;
      typeormUser.deletedDateTime = item.deletedDateTime;

      const groupsWithProfile = item.userGroupProfiles.map((profile) => {
        const typeormProfile = new TypeormUserGroupProfile();
        typeormProfile.userId = item.id;
        typeormProfile.groupId = profile.groupId;
        typeormProfile.nickname = profile.nickname;
        typeormProfile.hasProfileImage = profile.hasProfileImage;
        return typeormProfile;
      });

      return { user: typeormUser, userGroupProfile: groupsWithProfile };
    });

    return ret;
  }
}
