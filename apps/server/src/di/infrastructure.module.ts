import { Global, Module, Provider } from "@nestjs/common";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { join } from "path";
import { ServerConfig } from "../config/server-config";
import { DiTokens } from "./di-tokens";
import { TypeormUserRepository } from "../infrastructure/persistence/typeorm/repository/user/user-repository";
import { TypeormCommentRepository } from "../infrastructure/persistence/typeorm/repository/comment/comment-repository";
import { TypeormGroupRepository } from "../infrastructure/persistence/typeorm/repository/group/group-repository";
import { TypeormContentRepository } from "../infrastructure/persistence/typeorm/repository/content/content-repository";
import { TYPEORM_DIRECTORY } from "../infrastructure/persistence/typeorm/typeorm-directory";
import { APP_FILTER } from "@nestjs/core";
import { NestHttpExceptionFilter } from "../http-rest/exception-filter/nest-http-exception-filter";
import {
  AcceptInvitationUsecase,
  CreateGroupUsecase,
  DeleteGroupUsecase,
  DeleteUserUsecase,
  EditGroupUsecase,
  EditUserGroupProfileUsecase,
  EditUserUsecase,
  GetMediaContentListUsecase,
  GetGroupListUsecase,
  GetGroupMembersUsecase,
  GetGroupUsecase,
  GetOwnGroupListUsecase,
  GetUserUsecase,
  IContentRepository,
  IGroupRepository,
  InviteUserUsecase,
  IUserRepository,
} from "@repo/be-core";
import { MinioObjectStorageFactory } from "../infrastructure/persistence/object-storage/minio/minio-adapter";

export const typeormSqliteOptions = {
  type: "sqlite",
  database: join("db", ServerConfig.DB_FILE),
  autoLoadEntities: true,
  logging: ServerConfig.DB_LOG_ENABLE,
  entities: [join(TYPEORM_DIRECTORY, "entity", "**", "*.entity.{ts,js}")],

  synchronize: false,
  dropSchema: false,
} satisfies TypeOrmModuleOptions;

const persistenceProviders: Provider[] = [
  {
    provide: DiTokens.UserRepository,
    useClass: TypeormUserRepository,
  },
  {
    provide: DiTokens.GroupRepository,
    useClass: TypeormGroupRepository,
  },
  {
    provide: DiTokens.ContentRepository,
    useClass: TypeormContentRepository,
  },
  {
    provide: DiTokens.CommentRepository,
    useClass: TypeormCommentRepository,
  },
];

const userUsecaseProviders: Provider[] = [
  {
    provide: DiTokens.GetUserUsecase,
    useFactory: (userRepository: IUserRepository) =>
      new GetUserUsecase(userRepository),
    inject: [DiTokens.UserRepository],
  },
  {
    provide: DiTokens.GetGroupMemberUsecase,
    useFactory: (userRepository: IUserRepository) =>
      new GetGroupMembersUsecase(userRepository),
    inject: [DiTokens.UserRepository],
  },
  {
    provide: DiTokens.DeleteUserUsecase,
    useFactory: (userRepository: IUserRepository) =>
      new DeleteUserUsecase(userRepository),
    inject: [DiTokens.UserRepository],
  },
  {
    provide: DiTokens.EditUserUsecase,
    useFactory: (userRepository: IUserRepository) =>
      new EditUserUsecase(userRepository),
    inject: [DiTokens.UserRepository],
  },
  {
    provide: DiTokens.EditUserGroupProfileUsecase,
    useFactory: (userRepository: IUserRepository) =>
      new EditUserGroupProfileUsecase(userRepository),
    inject: [DiTokens.UserRepository],
  },
  {
    provide: DiTokens.CreateGroupUsecase,
    useFactory: (groupRepository: IGroupRepository) =>
      new CreateGroupUsecase(groupRepository),
    inject: [DiTokens.GroupRepository],
  },
];

const groupUsecaseProviders: Provider[] = [
  {
    provide: DiTokens.GetGroupUsecase,
    useFactory: (groupRepository: IGroupRepository) =>
      new GetGroupUsecase(groupRepository),
    inject: [DiTokens.GroupRepository],
  },
  {
    provide: DiTokens.GetGroupListUsecase,
    useFactory: (groupRepository: IGroupRepository) =>
      new GetGroupListUsecase(groupRepository),
    inject: [DiTokens.GroupRepository],
  },
  {
    provide: DiTokens.GetOwnGroupListUsecase,
    useFactory: (groupRepository: IGroupRepository) =>
      new GetOwnGroupListUsecase(groupRepository),
    inject: [DiTokens.GroupRepository],
  },
  {
    provide: DiTokens.EditGroupUsecase,
    useFactory: (groupRepository: IGroupRepository) =>
      new EditGroupUsecase(groupRepository),
    inject: [DiTokens.GroupRepository],
  },
  {
    provide: DiTokens.InviteUserUsecase,
    useFactory: (groupRepository: IGroupRepository) =>
      new InviteUserUsecase(groupRepository),
    inject: [DiTokens.GroupRepository],
  },
  {
    provide: DiTokens.DeleteGroupUsecase,
    useFactory: (groupRepository: IGroupRepository) =>
      new DeleteGroupUsecase(groupRepository),
    inject: [DiTokens.GroupRepository],
  },
  {
    provide: DiTokens.AcceptInvitationUsecase,
    useFactory: (groupRepository: IGroupRepository) =>
      new AcceptInvitationUsecase(groupRepository),
    inject: [DiTokens.GroupRepository],
  },
];

const contentUsecaseProviders: Provider[] = [
  {
    provide: DiTokens.GetMediaContentListUsecase,
    useFactory: (contentRepository: IContentRepository) =>
      new GetMediaContentListUsecase(contentRepository),
    inject: [DiTokens.ContentRepository],
  },
];

const globalProviders: Provider[] = [
  {
    provide: APP_FILTER,
    useClass: NestHttpExceptionFilter,
  },
];

const objectStorageProviders: Provider[] = [
  {
    provide: DiTokens.ObjectStorageFactory,
    useFactory: async () => {
      const objectStorage = new MinioObjectStorageFactory();
      await objectStorage.init();
      return objectStorage;
    },
  },
  {
    provide: DiTokens.MediaObjectStorage,
    useFactory: async (factory: MinioObjectStorageFactory) => {
      return factory.getObjectStorageAdapter(
        ServerConfig.OBJECT_STORAGE_MEDIA_BUCKET,
      );
    },
    inject: [DiTokens.ObjectStorageFactory],
  },
];

// NOTE : dynamic module의 object에 덮어 씌워짐
@Global()
@Module({
  imports: [TypeOrmModule.forRoot(typeormSqliteOptions)],
  providers: [
    ...persistenceProviders,

    ...userUsecaseProviders,
    ...groupUsecaseProviders,
    ...contentUsecaseProviders,

    ...objectStorageProviders,

    ...globalProviders,
  ],
  exports: [
    ...persistenceProviders,

    ...userUsecaseProviders,
    ...groupUsecaseProviders,
    ...contentUsecaseProviders,

    ...objectStorageProviders,
  ],
})
export class InfrastructureModule {}
