import { User } from '../../domain/user/entity/user';

export interface IUserRepository {
  addUser(user: User): Promise<User>;

  getUserById(id: string): Promise<User | null>;

  getUserByGroupId(groupId: string): Promise<User[]>;

  getUserByUsernameOfGroup(payload: {
    username: string;
    groupId: string;
  }): Promise<User | null>;

  updateUser(user: User): Promise<boolean>;

  deleteUser(id: string): Promise<boolean>;
}
