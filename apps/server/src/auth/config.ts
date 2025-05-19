export const AuthModuleConfig = {
  GoogleCallbackPath: '/login/google/callback',
  AccessTokenCookieName: 'access_token',
  AccessTokenValidTime: 1000 * 60 * 5, // 5분

  JwtUserKeyInRequest: 'jwtUser',
} as const;
