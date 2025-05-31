import { Module, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ServerConfig } from '../config/server-config';
import { DiTokens } from './di-tokens';
import { AuthModuleConfig } from '../auth/config';
import { TypeormUserRepository } from './user-repository';
import { IUserRepository, UserService } from '@repo/be-core';

const providers: Provider[] = [
  {
    provide: DiTokens.UserRepository,
    useClass: TypeormUserRepository,
  },
  {
    provide: UserService,
    useFactory: (userRepository: IUserRepository) => {
      return new UserService(userRepository);
    },
    inject: [DiTokens.UserRepository],
  },
];

@Module({
  imports: [
    JwtModule.register({
      secret: ServerConfig.JWT_SECRET,
      signOptions: {
        expiresIn: AuthModuleConfig.AccessTokenValidTime,
      },
      verifyOptions: { ignoreExpiration: false },
    }),
  ],
  providers: [...providers],
  exports: [UserService],
})
export class UserModule {}
