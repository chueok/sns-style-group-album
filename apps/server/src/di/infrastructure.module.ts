import { DynamicModule, Provider } from "@nestjs/common";
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
import { NestHttpExceptionFilter } from "../http-rest/exception-filter/NestHttpExceptionFilter";
import {
  DeleteUserUsecase,
  GetGroupMembersUsecase,
  GetUserUsecase,
  IUserRepository,
} from "@repo/be-core";
import { MinioObjectStorageFactory } from "../infrastructure/persistence/object-storage/minio/minio-adapter";

const typeormSqliteOptions = {
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

const usecaseProviders: Provider[] = [
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
];

const providers: Provider[] = [
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
// @Global()
// @Module({
//   imports: [TypeOrmModule.forRoot(typeormSqliteOptions)],
//   providers: [...persistenceProviders],
// })
export class InfrastructureModule {
  static forRoot(payload?: {
    database?: string;
    synchronize?: boolean;
    dropSchema?: boolean;
  }): DynamicModule {
    const options = {
      ...typeormSqliteOptions,
      database: payload?.database || typeormSqliteOptions.database,
      synchronize: payload?.synchronize || typeormSqliteOptions.synchronize,
      dropSchema: payload?.dropSchema || typeormSqliteOptions.dropSchema,
    };

    return {
      module: InfrastructureModule,
      global: true,
      imports: [TypeOrmModule.forRoot(options)],
      providers: [
        ...persistenceProviders,
        ...usecaseProviders,
        ...providers,
        ...objectStorageProviders,
      ],
      exports: [
        DiTokens.UserRepository,
        DiTokens.GroupRepository,
        DiTokens.ContentRepository,
        DiTokens.CommentRepository,

        DiTokens.GetUserUsecase,
        DiTokens.GetGroupMemberUsecase,
        DiTokens.DeleteUserUsecase,

        DiTokens.MediaObjectStorage,
      ],
    };
  }
}
