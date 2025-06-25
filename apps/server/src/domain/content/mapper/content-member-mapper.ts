import { SContentMember, TContentMember } from '@repo/be-core';
import { TypeormMember } from '../../../typeorm/entity/group/typeorm-member.entity';

export class ContentMemberMapper {
  public static toDomainEntity(payload: TypeormMember): TContentMember {
    const { id, groupId } = payload;

    return SContentMember.parse({
      id,
      groupId,
    });
  }
}
