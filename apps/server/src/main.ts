import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ServerConfig } from './config/server-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
