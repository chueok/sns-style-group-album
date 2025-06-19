import z from 'zod';
import { Nullable } from '../../common/type/common-types';
import { TMemberProfile } from './entity/member-profile';
import { TUser } from './entity/user';

export type TEditableUser = Pick<TUser, 'username' | 'profileImageUrl'>;

export const SMemberPaginationParams = z.object({
  page: z.number().nullish(),
  pageSize: z.number(),
});

export type TMemberPaginationParams = z.infer<typeof SMemberPaginationParams>;

export type TMemberPaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/**
 * user 로직을 수행하기 위한 entity 와
 * 단순히 데이터를 보여주기 위한 entity를 분리해야 할까?
 */
export interface IUserRepository {
  updateUser(userId: string, user: Partial<TEditableUser>): Promise<boolean>;

  findUserById(id: string): Promise<Nullable<TUser>>;

  findMemberProfilesByPagination(payload: {
    groupId: string;
    pagination: TMemberPaginationParams;
  }): Promise<TMemberPaginatedResult<TMemberProfile>>;

  findMemberProfiles(payload: {
    groupId: string;
    userIds: string[];
  }): Promise<TMemberProfile[]>;

  findUsersByGroupId(groupId: string): Promise<TUser[]>;

  updateGroupProfile(payload: {
    userId: string;
    groupId: string;
    username?: string;
    profileImageUrl?: string;
  }): Promise<TUser>;

  isUserInGroup(userId: string, groupId: string): Promise<boolean>;

  deleteUser(userId: string): Promise<void>;

  createProfileImageUploadUrl(userId: string): Promise<string>;

  deleteProfileImage(userId: string): Promise<void>;
}
