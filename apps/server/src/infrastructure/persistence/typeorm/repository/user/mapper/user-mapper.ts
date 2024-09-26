import { CreateUserEntityPayload, User } from "@repo/be-core";
import { TypeormUser } from "../../../entity/user/typeorm-user.entity";
import { TypeormGroup } from "../../../entity/group/typeorm-group.entity";

type ToDomainPayloadType = {
  elements: {
    user: TypeormUser;
    groups: TypeormGroup[];
    ownGroups: TypeormGroup[];
    groupsWithProfile: TypeormGroup[];
  }[];
};

type ToDomainReturnType = {
  results: User[];
  errors: Error[];
};

export class UserMapper {
  public static async toDomainEntity(
    payload: ToDomainPayloadType,
  ): Promise<ToDomainReturnType> {
    const results: User[] = [];
    const errors: Error[] = [];

    const { elements } = payload;

    const promiseList = elements.map(async (item) => {
      const { user, groups, ownGroups, groupsWithProfile } = item;

      const userPayload: CreateUserEntityPayload<"existing"> = {
        username: user.username,
        email: user.email,
        thumbnailRelativePath: user.thumbnailRelativePath,

        groups: groups.map((group) => group.id),
        ownGroups: ownGroups.map((group) => group.id),
        groupsWithProfile: groupsWithProfile.map((group) => group.id),

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

  public static toOrmEntity(payload: User[]): TypeormUser[] {
    const userList = payload.map((item) => {
      const typeormUser = new TypeormUser();
      typeormUser.id = item.id;
      typeormUser.username = item.username;
      typeormUser.thumbnailRelativePath = item.thumbnailRelativePath;

      const groupsWithProfile = item.groupsWithProfile.map((groupId) => {
        const group = new TypeormGroup();
        group.id = groupId;
        return group;
      });
      typeormUser.groupsWithProfile = Promise.resolve(groupsWithProfile);

      typeormUser.createdDateTime = item.createdDateTime;
      typeormUser.updatedDateTime = item.updatedDateTime;
      typeormUser.deletedDateTime = item.deletedDateTime;
      return typeormUser;
    });

    return userList;
  }
}
