import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthProviderEnum } from '../auth-provider-enum';

@Injectable()
export class HttpGoogleAuthGuard extends AuthGuard(AuthProviderEnum.GOOGLE) {}
