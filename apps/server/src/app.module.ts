import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfrastructureModule } from './di/infrastructure.module';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from 'nestjs-pino';
import { TrpcModule } from './trpc/trpc.module';

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
    TrpcModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
