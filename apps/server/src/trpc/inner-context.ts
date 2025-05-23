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
