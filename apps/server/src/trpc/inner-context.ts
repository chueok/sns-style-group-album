import { UserService } from '@repo/be-core';
import { AuthService } from '../auth/auth-service';

export const createAuthInnerContext = ({
  authService,
}: {
  authService: AuthService;
}) => {
  return {
    authService,
  };
};

export const createUserInnerContext = ({
  userService,
}: {
  userService: UserService;
}) => {
  return {
    userService,
  };
};
