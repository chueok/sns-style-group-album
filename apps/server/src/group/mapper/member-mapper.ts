import { SMember, TMember } from '@repo/be-core';
import { TypeormMember } from '../../infrastructure/persistence/typeorm/entity/group/typeorm-member.entity';

export class MemberMapper {
  public static toDomainEntity(
    payload: Pick<
      TypeormMember,
      | 'id'
      | 'username'
      | 'profileImageUrl'
      | 'role'
      | 'joinRequestDateTime'
      | 'joinDateTime'
    >
  ): TMember {
    const obj: TMember = {
      id: payload.id,
      username: payload.username,
      profileImageUrl: payload.profileImageUrl || undefined,
      role: payload.role,
      joinRequestDateTime: payload.joinRequestDateTime,
      joinDateTime: payload.joinDateTime || undefined,
    };

    const result = SMember.parse(obj);

    return result;
  }

  public static toDomainEntityList(
    payload: Pick<
      TypeormMember,
      | 'id'
      | 'username'
      | 'profileImageUrl'
      | 'role'
      | 'joinRequestDateTime'
      | 'joinDateTime'
    >[]
  ): TMember[] {
    return payload.map((member) => this.toDomainEntity(member));
  }
}
