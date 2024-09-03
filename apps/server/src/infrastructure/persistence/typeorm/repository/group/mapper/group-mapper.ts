import { CreateGroupEntityPayload, Group, Nullable } from "@repo/be-core";
import { TypeormGroup } from "../../../entity/group/typeorm-group.entity";

export class GroupMapper {
  public static toDomainEntity(payload: TypeormGroup): Promise<Nullable<Group>>;
  public static toDomainEntity(payload: TypeormGroup[]): Promise<Group[]>;
  public static async toDomainEntity(
    payload: TypeormGroup | TypeormGroup[],
  ): Promise<Nullable<Group> | Group[]> {
    const payloadList = Array.isArray(payload) ? payload : [payload];

    const promises = payloadList.map(async (item) => {
      const members = (await item.members).map((member) => member.id);

      const groupPayload: CreateGroupEntityPayload<"existing"> = {
        ownerId: (await item.owner).id,
        name: item.name,
        id: item.id,
        members,
        createdDateTime: item.createdDateTime,
        updatedDateTime: item.updatedDateTime,
        deletedDateTime: item.deletedDateTime,
      };

      return Group.new(groupPayload).catch((error) => {
        // TODO 에러 로깅
        console.log(error.data.errors);
        return null;
      });
    });
    const domainEntities = (await Promise.all(promises)).filter(
      (item) => item !== null,
    );

    if (Array.isArray(payload)) {
      return domainEntities;
    } else {
      return domainEntities[0] || null;
    }
  }

  public static toOrmEntity(payload: Group): TypeormGroup;
  public static toOrmEntity(payload: Group[]): TypeormGroup[];
  public static toOrmEntity(
    payload: Group | Group[],
  ): TypeormGroup | TypeormGroup[] {
    const payloadList = Array.isArray(payload) ? payload : [payload];

    const groupList = payloadList.map((item) => {
      const typeormGroup = new TypeormGroup();
      typeormGroup.id = item.id;
      typeormGroup.name = item.name;
      typeormGroup.ownerId = item.ownerId;

      typeormGroup.createdDateTime = item.createdDateTime;
      typeormGroup.updatedDateTime = item.updatedDateTime;
      typeormGroup.deletedDateTime = item.deletedDateTime;
      return typeormGroup;
    });

    if (Array.isArray(payload)) {
      return groupList;
    } else {
      return groupList[0]!;
    }
  }
}
