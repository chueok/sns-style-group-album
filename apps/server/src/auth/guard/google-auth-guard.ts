import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EPassportStrategy } from './passport/passport-strategies-enum';

@Injectable()
export class HttpGoogleAuthGuard extends AuthGuard(EPassportStrategy.GOOGLE) {}
