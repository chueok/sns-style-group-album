import { Module, Provider } from '@nestjs/common';
import { GroupService, IGroupRepository } from '@repo/be-core';
import { DiTokens } from './di-tokens';
import { TypeormGroupRepository } from './group-repository';

const providers: Provider[] = [
  {
    provide: DiTokens.GroupRepository,
    useClass: TypeormGroupRepository,
  },
  {
    provide: GroupService,
    useFactory: (groupRepository: IGroupRepository) => {
      return new GroupService(groupRepository);
    },
    inject: [DiTokens.GroupRepository],
  },
];

@Module({
  providers: [...providers],
  exports: [GroupService, DiTokens.GroupRepository],
})
export class GroupModule {}
