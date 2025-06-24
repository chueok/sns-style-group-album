import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ServerConfig } from './config/server-config';
import { Logger } from 'nestjs-pino';
import {
  addTransactionalDataSource,
  initializeTransactionalContext,
} from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(Logger));

  // 트랜잭션 설정
  const dataSource = app.get(DataSource);
  initializeTransactionalContext();
  addTransactionalDataSource(dataSource);

  // TODO : production 에서 정상적으로 cors 작동하는지 확인 필요.
  app.enableCors({
    origin: ServerConfig.isProduction ? ServerConfig.CLIENT_ENDPOINT : true,
    credentials: true,
  });

  app.use(cookieParser());

  await app.listen(3001);
}
void bootstrap();
