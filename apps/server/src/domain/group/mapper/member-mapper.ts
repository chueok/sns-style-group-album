import { SMember, TMember } from '@repo/be-core';
import { TypeormMember } from '../../../typeorm/entity/group/typeorm-member.entity';

export class MemberMapper {
  public static toDomainEntity(payload: TypeormMember): TMember {
    const obj: TMember = {
      id: payload.id,
      groupId: payload.groupId,
      userId: payload.userId,
      username: payload.username,
      profileImageUrl: payload.profileImageUrl || undefined,
      role: payload.role,
      status: payload.status,
      joinRequestDateTime: payload.joinRequestDateTime,
      joinDateTime: payload.joinDateTime || undefined,
    };

    const result = SMember.parse(obj);

    return result;
  }

  public static toDomainEntityList(payload: TypeormMember[]): TMember[] {
    return payload.map((member) => this.toDomainEntity(member));
  }
}
