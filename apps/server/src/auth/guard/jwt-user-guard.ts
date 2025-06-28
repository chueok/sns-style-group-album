import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from '../auth-service';
import { AuthModuleConfig } from '../config';

@Injectable()
export class JwtUserGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const { user } = await this.authService.getMe({
      req: request,
      res: response,
    });

    request[AuthModuleConfig.JwtUserKeyInRequest] = user;

    return true;
  }
}
