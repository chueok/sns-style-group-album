import { TGroup } from '@repo/be-core';
import { TypeormGroup } from '../../infrastructure/persistence/typeorm/entity/group/typeorm-group.entity';

export class GroupMapper {
  public static toDomainEntity(payload: TypeormGroup): TGroup {
    const {
      id,
      ownerId,
      name,
      createdDateTime,
      updatedDateTime,
      deletedDateTime,
    } = payload;

    const group: TGroup = {
      id,
      ownerId,
      name,
      createdDateTime,
      updatedDateTime,
      deletedDateTime,
    };

    return group;
  }

  public static toDomainEntityList(payload: TypeormGroup[]): TGroup[] {
    return payload.map((item) => this.toDomainEntity(item));
  }
}
