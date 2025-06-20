import {
  GroupId,
  SGroupMember,
  TGroupJoinRequestUser,
  TGroupMember,
} from '@repo/be-core';
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
      id: payload.id,
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

export class JoinRequestUserMapper {
  public static toDomainEntity(
    groupId: string,
    payload: Pick<
      TypeormUser,
      'id' | 'username' | 'profileImageUrl' | '__joinRequestGroups__'
    >
  ): TGroupJoinRequestUser {
    if (!payload.__joinRequestGroups__) {
      throw new Error('sql error : __joinRequestGroups__ is null');
    }

    const requestUser = payload.__joinRequestGroups__?.at(0);
    if (!requestUser) {
      throw new Error('sql error : requestUser is null');
    }
    const requestedDateTime = requestUser.requestedDateTime;

    return {
      id: payload.id,
      username: payload.username || '',
      profileImageUrl: payload.profileImageUrl || null,
      requestedDateTime,
    };
  }

  public static toDomainEntityList(
    groupId: string,
    payload: Pick<
      TypeormUser,
      'id' | 'username' | 'profileImageUrl' | '__joinRequestGroups__'
    >[]
  ): TGroupJoinRequestUser[] {
    return payload.map((member) => this.toDomainEntity(groupId, member));
  }
}
