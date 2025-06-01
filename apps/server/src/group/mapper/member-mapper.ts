import { GroupId, SGroupMember, TGroupMember } from '@repo/be-core';
import { TypeormUser } from '../../infrastructure/persistence/typeorm/entity/user/typeorm-user.entity';

const getGroupProfile = (
  payload: Pick<TypeormUser, '__userGroupProfiles__'>,
  groupId: string
): {
  profileImageUrl: string | null;
  username: string | null;
} => {
  if (!payload.__userGroupProfiles__) {
    return {
      profileImageUrl: null,
      username: null,
    };
  }
  const groupProfile = payload.__userGroupProfiles__.find(
    (profile) => profile.groupId === (groupId as GroupId)
  );
  return {
    profileImageUrl: groupProfile?.profileImageUrl || null,
    username: groupProfile?.username || null,
  };
};

export class MemberMapper {
  public static toDomainEntity(
    groupId: string,
    payload: Pick<
      TypeormUser,
      'id' | 'username' | 'profileImageUrl' | '__userGroupProfiles__'
    >
  ): TGroupMember {
    let { profileImageUrl, username } = getGroupProfile(payload, groupId);

    if (!profileImageUrl) {
      profileImageUrl = payload.profileImageUrl;
    }
    if (!username) {
      username = payload.username || '';
    }

    const obj: TGroupMember = {
      userId: payload.id,
      username,
      profileImageUrl,
    };

    const result = SGroupMember.parse(obj);

    return result;
  }

  public static toDomainEntityList(
    groupId: string,
    payload: Pick<
      TypeormUser,
      'id' | 'username' | 'profileImageUrl' | '__userGroupProfiles__'
    >[]
  ): TGroupMember[] {
    return payload.map((member) => this.toDomainEntity(groupId, member));
  }
}
