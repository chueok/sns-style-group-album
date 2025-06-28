import { Module, Provider } from '@nestjs/common';
import {
  GroupService,
  IGroupRepository,
  ISystemContentCommentPort,
} from '@repo/be-core';
import { DiTokens } from './di-tokens';
import { TypeormGroupRepository } from './group-repository';
import { DiTokens as AdapterDiTokens } from '../../adapter/di-tokens';

const providers: Provider[] = [
  {
    provide: DiTokens.GroupRepository,
    useClass: TypeormGroupRepository,
  },
  {
    provide: GroupService,
    useFactory: (
      groupRepository: IGroupRepository,
      systemContentCommentAdapter: ISystemContentCommentPort
    ) => {
      return new GroupService(groupRepository, systemContentCommentAdapter);
    },
    inject: [
      DiTokens.GroupRepository,
      AdapterDiTokens.SystemContentCommentAdapter,
    ],
  },
];

@Module({
  providers: [...providers],
  exports: [GroupService, DiTokens.GroupRepository],
})
export class GroupModule {}
