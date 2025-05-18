import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfrastructureModule } from './di/infrastructure.module';
import { AuthModule } from './auth/auth.module';
import { UserController } from './http-rest/controller/user-controller';
import { CommentController } from './http-rest/controller/comment-controller';
import { GroupController } from './http-rest/controller/group-controller';
import { ContentController } from './http-rest/controller/content-controller';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    // TODO: 로거 포멧 커스터마이징 필요
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
            colorize: true,
            levelFirst: false,
            messageFormat: '[Nest] {pid} - {time} {level} [{context}] {msg}',
            ignore:
              'hostname,time,context,req.headers,req.remoteAddress,req.remotePort,res.headers',
            customLevels: {
              log: 30,
            },
            customColors: {
              log: 'blue',
            },
          },
        },
        customProps: (req, res) => ({
          context: 'HTTP',
          time: Date.now(),
          msg: `${req.method} ${req.url} - ${res.statusCode}`,
        }),
        customLogLevel: (req, res, error) => {
          if (error || res.statusCode >= 400) return 'error';
          return 'info';
        },
      },
    }),
    InfrastructureModule,
    AuthModule,
  ],
  controllers: [
    AppController,
    UserController,
    GroupController,
    CommentController,
    ContentController,
  ],
  providers: [AppService],
})
export class AppModule {}
