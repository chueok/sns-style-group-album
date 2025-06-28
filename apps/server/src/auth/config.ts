export const AuthModuleConfig = {
  GoogleCallbackPath: '/login/google/callback',

  AccessTokenCookieName: 'access_token',
  AccessTokenValidTime: 5 * 60, // 5 minutes
  AccessTokenMaxAgeInCookie: 5 * 60 * 1000,

  RefreshTokenCookieName: 'refresh_token',
  RefreshTokenValidTime: 7 * 24 * 60 * 60, // 7 days
  RefreshTokenMaxAgeInCookie: 7 * 24 * 60 * 60 * 1000,

  JwtUserKeyInRequest: 'jwtUser',
} as const;
