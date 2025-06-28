import { TGroup } from '@repo/be-core';
import { TypeormGroup } from '../../../typeorm/entity/group/typeorm-group.entity';

export class GroupMapper {
  public static toDomainEntity(payload: TypeormGroup): TGroup {
    const { id, name, createdDateTime, updatedDateTime } = payload;

    const group: TGroup = {
      id,
      name,
      createdDateTime,
      updatedDateTime: updatedDateTime || undefined,
    };

    return group;
  }

  public static toDomainEntityList(payload: TypeormGroup[]): TGroup[] {
    return payload.map((item) => this.toDomainEntity(item));
  }
}
