import { CreateGroupEntityPayload, Group, UserId } from "@repo/be-core";
import { TypeormGroup } from "../../../entity/group/typeorm-group.entity";
import { TypeormUser } from "../../../entity/user/typeorm-user.entity";

type ToDomainPayloadType = {
  elements: {
    group: TypeormGroup;
    members: UserId[];
    invitedUsers: UserId[];
  }[];
};

type ToDomainReturnType = {
  results: Group[];
  errors: Error[];
};

export class GroupMapper {
  public static async toDomainEntity(
    payload: ToDomainPayloadType,
  ): Promise<ToDomainReturnType> {
    const { elements } = payload;
    const results: Group[] = [];
    const errors: Error[] = [];

    const promiseList = elements.map(async (item) => {
      const groupPayload: CreateGroupEntityPayload<"existing"> = {
        ownerId: item.group.ownerId,
        name: item.group.name,
        id: item.group.id,
        members: item.members,
        invitedUserList: item.invitedUsers,
        createdDateTime: item.group.createdDateTime,
        updatedDateTime: item.group.updatedDateTime,
        deletedDateTime: item.group.deletedDateTime,
      };

      return Group.new(groupPayload);
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

  public static toOrmEntity(payload: Group[]): TypeormGroup[] {
    return payload.map((item) => {
      const typeormGroup = new TypeormGroup();
      typeormGroup.id = item.id;
      typeormGroup.name = item.name;
      typeormGroup.ownerId = item.ownerId;

      typeormGroup.members = Promise.resolve(
        item.members.map((userId) => {
          const member = new TypeormUser();
          member.id = userId;
          return member;
        }),
      );

      typeormGroup.createdDateTime = item.createdDateTime;
      typeormGroup.updatedDateTime = item.updatedDateTime;
      typeormGroup.deletedDateTime = item.deletedDateTime;
      return typeormGroup;
    });
  }
}
