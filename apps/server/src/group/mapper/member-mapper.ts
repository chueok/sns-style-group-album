import { SMember, TMember } from '@repo/be-core';
import { TypeormMember } from '../../infrastructure/persistence/typeorm/entity/group/typeorm-group-member.entity';

export class MemberMapper {
  public static toDomainEntity(
    payload: Pick<
      TypeormMember,
      | 'userId'
      | 'username'
      | 'profileImageUrl'
      | 'role'
      | 'joinRequestDateTime'
      | 'joinDateTime'
    >
  ): TMember {
    const obj: TMember = {
      id: payload.userId,
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
      | 'userId'
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
