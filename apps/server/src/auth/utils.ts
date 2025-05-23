import { CookieOptions, Response } from 'express';
import { ServerConfig } from '../config/server-config';

export const setSecureCookie = (input: {
  res: Response;
  name: string;
  val: string;
  cookieOptions?: CookieOptions;
}) => {
  const { res, name, val, cookieOptions = {} } = input;

  res.cookie(name, val, {
    ...cookieOptions,
    httpOnly: true,
    secure: ServerConfig.isProduction,
    sameSite: ServerConfig.isProduction ? 'strict' : 'lax',
    domain: ServerConfig.COOKIE_DOMAIN,
  });
};
