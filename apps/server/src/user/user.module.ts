import { Module, Provider } from '@nestjs/common';
import { DiTokens } from './di-tokens';
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
  providers: [...providers],
  exports: [UserService, DiTokens.UserRepository],
})
export class UserModule {}
