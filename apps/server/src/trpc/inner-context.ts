import {
  GroupService,
  IGroupRepository,
  IUserRepository,
  UserService,
} from '@repo/be-core';
import { AuthService } from '../auth/auth-service';
import { DataSource } from 'typeorm';
import { IAuthRepository } from '../auth/auth-repository.interface';

export const createAuthInnerContext = ({
  authService,
  authRepository,
}: {
  authService: AuthService;
  authRepository: IAuthRepository;
}) => {
  return {
    authService,
    authRepository,
  };
};

export const createUserInnerContext = ({
  userService,
  userRepository,
}: {
  userService: UserService;
  userRepository: IUserRepository;
}) => {
  return {
    userService,
    userRepository,
  };
};

export const createGroupInnerContext = ({
  groupService,
  groupRepository,
}: {
  groupService: GroupService;
  groupRepository: IGroupRepository;
}) => {
  return {
    groupService,
    groupRepository,
  };
};

export const createSeedInnerContext = ({
  dataSource,
}: {
  dataSource: DataSource;
}) => {
  return {
    dataSource,
  };
};
