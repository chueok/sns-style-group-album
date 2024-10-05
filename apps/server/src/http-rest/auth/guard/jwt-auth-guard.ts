import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthProviderEnum } from "../auth-provider-enum";

// TODO : AuthGuard 를 반환하는 함수를 만들어서 상황에 맞게 사용하도록 수정 필요. (DB 응답 개선)
@Injectable()
export class HttpJwtAuthGuard extends AuthGuard(AuthProviderEnum.JWT) {}
