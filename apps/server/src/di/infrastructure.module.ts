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
  DeleteUserUsecase,
  EditUserGroupProfileUsecase,
  EditUserUsecase,
  GetGroupMembersUsecase,
  GetGroupUsecase,
  GetUserUsecase,
  IGroupRepository,
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
];

const groupUsecaseProviders: Provider[] = [
  {
    provide: DiTokens.GetGroupUsecase,
    useFactory: (groupRepository: IGroupRepository) =>
      new GetGroupUsecase(groupRepository),
    inject: [DiTokens.GroupRepository],
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
    ...objectStorageProviders,

    ...globalProviders,
  ],
  exports: [
    ...persistenceProviders,

    ...userUsecaseProviders,
    ...groupUsecaseProviders,

    ...objectStorageProviders,
  ],
})
export class InfrastructureModule {}
