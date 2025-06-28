import { Global, Module, Provider } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { ServerConfig } from './config/server-config';
import { DiTokens } from './adapter/di-tokens';
import { APP_FILTER } from '@nestjs/core';
import { NestHttpExceptionFilter } from './nest/nest-http-exception-filter';
import { MinioObjectStorage } from './adapter/minio-object-storage';
import { DataSource } from 'typeorm';
import { SystemContentCommentAdapter } from './adapter/system-content-comment';
import { TYPEORM_DIRECTORY } from './typeorm/typeorm-directory';

export const typeormSqliteOptions = {
  type: 'sqlite',
  database: join('db', ServerConfig.DB_FILE),
  autoLoadEntities: true,
  logging: ServerConfig.DB_LOG_ENABLE,
  entities: [join(TYPEORM_DIRECTORY, 'entity', '**', '*.entity.{ts,js}')],

  synchronize: true,
  dropSchema: true,
} satisfies TypeOrmModuleOptions;

const globalProviders: Provider[] = [
  {
    provide: APP_FILTER,
    useClass: NestHttpExceptionFilter,
  },
];

const providers: Provider[] = [
  {
    provide: DiTokens.ObjectStorage,
    useFactory: async () => {
      const objectStorage = new MinioObjectStorage();
      return objectStorage;
    },
  },
  {
    provide: DiTokens.SystemContentCommentAdapter,
    useFactory: (dataSource: DataSource) => {
      return new SystemContentCommentAdapter(dataSource);
    },
    inject: [DataSource],
  },
];

// NOTE : dynamic module의 object에 덮어 씌워짐
@Global()
@Module({
  imports: [TypeOrmModule.forRoot(typeormSqliteOptions)],
  providers: [...providers, ...globalProviders],
  exports: [...providers],
})
export class InfrastructureModule {}
