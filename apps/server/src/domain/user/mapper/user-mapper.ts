import { TUser } from '@repo/be-core';
import { TypeormUser } from '../../../typeorm/entity/user/typeorm-user.entity';

export class UserMapper {
  public static toDomainEntity(payload: TypeormUser): TUser {
    const { id, username, email, profileImageUrl, createdDateTime } = payload;

    const user: TUser = {
      id,
      username: username || '',
      email,
      profileImageUrl,
      createdDateTime,
    };

    return user;
  }

  public static toDomainEntityList(payload: TypeormUser[]): TUser[] {
    return payload.map((item) => this.toDomainEntity(item));
  }
}
