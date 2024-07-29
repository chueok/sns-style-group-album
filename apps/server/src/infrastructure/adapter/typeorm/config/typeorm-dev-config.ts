import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

const entitiesPath = join(__dirname, '..', '**', '*.entity.{ts,js}');

export const sqliteDevOptions: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'db/dev.sqlite',
  autoLoadEntities: true,
  logging: true,
  entities: [entitiesPath],

  // 개발용
  synchronize: true,
  dropSchema: true,
};
