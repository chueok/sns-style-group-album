import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ServerConfig } from './config/server-config';
import { Logger } from 'nestjs-pino';
import {
  addTransactionalDataSource,
  initializeTransactionalContext,
} from 'typeorm-transactional';
import { DataSource } from 'typeorm';

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
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SNS style group album API')
    .setDescription('API for SNS style group album')
    .setVersion('1.0')
    .addTag('comments')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(3001);
}
void bootstrap();
