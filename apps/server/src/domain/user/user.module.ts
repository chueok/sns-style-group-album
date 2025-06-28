import { Module, Provider } from '@nestjs/common';
import { DiTokens } from './di-tokens';
import { TypeormUserRepository } from './user-repository';
import {
  IObjectStoragePort,
  IUserRepository,
  UserService,
} from '@repo/be-core';
import { DiTokens as CommonDiTokens } from '../../adapter/di-tokens';

const providers: Provider[] = [
  {
    provide: DiTokens.UserRepository,
    useClass: TypeormUserRepository,
  },
  {
    provide: UserService,
    useFactory: (
      userRepository: IUserRepository,
      objectStorage: IObjectStoragePort
    ) => {
      return new UserService(userRepository, objectStorage);
    },
    inject: [DiTokens.UserRepository, CommonDiTokens.ObjectStorage],
  },
];

@Module({
  providers: [...providers],
  exports: [UserService, DiTokens.UserRepository],
})
export class UserModule {}
