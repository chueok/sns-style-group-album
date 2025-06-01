import {
  SGroupProfile,
  SSimpleGroupInfo,
  TGroupProfile,
  TSimpleGroupInfo,
  TUser,
} from '@repo/be-core';
import { TypeormUser } from '../../infrastructure/persistence/typeorm/entity/user/typeorm-user.entity';

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

    const user: TUser = {
      id,
      username: username || '',
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
