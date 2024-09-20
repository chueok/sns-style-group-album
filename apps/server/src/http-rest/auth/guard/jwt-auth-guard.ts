import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthProviderEnum } from "../auth-provider-enum";

@Injectable()
export class HttpJwtAuthGuard extends AuthGuard(AuthProviderEnum.JWT) {}
