import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { ServerConfig } from '../config/server-config';

@Catch()
export class NestHttpExceptionFilter implements ExceptionFilter {
  static readonly isProduction = ServerConfig.NODE_ENV === 'production';

  public catch(error: Error, host: ArgumentsHost): void {
    const _request: Request = host.switchToHttp().getRequest();
    const response: Response = host.switchToHttp().getResponse<Response>();

    response.status(500).json(error);
  }
}
