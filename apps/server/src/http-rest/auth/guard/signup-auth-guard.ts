import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthProviderEnum } from "../auth-provider-enum";

@Injectable()
export class HttpSignupAuthGuard extends AuthGuard(
  AuthProviderEnum.JWT_SIGNUP,
) {}
