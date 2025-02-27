import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  UnauthorizedException,
} from "@nestjs/common";
import { Request, Response } from "express";
import { RestResponse } from "../controller/dto/common/rest-response";
import { Code, Exception } from "@repo/be-core";
import { ServerConfig } from "../../config/server-config";

@Catch()
export class NestHttpExceptionFilter implements ExceptionFilter {
  static readonly isProduction = ServerConfig.NODE_ENV === "production";

  public catch(error: Error, host: ArgumentsHost): void {
    const request: Request = host.switchToHttp().getRequest();
    const response: Response = host.switchToHttp().getResponse<Response>();

    let errorResponse: RestResponse<unknown> = RestResponse.error(
      Code.INTERNAL_ERROR.code,
      Code.INTERNAL_ERROR.message,
    );

    errorResponse = this.handleNestError(error, errorResponse);
    errorResponse = this.handleCoreException(error, errorResponse);

    response.status(errorResponse.code).json(errorResponse);
  }

  private handleNestError(
    error: Error,
    errorResponse: RestResponse<unknown>,
  ): RestResponse<unknown> {
    if (error instanceof HttpException) {
      if (error instanceof UnauthorizedException) {
        errorResponse = RestResponse.error(
          Code.UNAUTHORIZED_ERROR.code,
          Code.UNAUTHORIZED_ERROR.message,
          NestHttpExceptionFilter.isProduction ? null : error.cause,
        );
      } else if (error instanceof ForbiddenException) {
        errorResponse = RestResponse.error(
          Code.ACCESS_DENIED_ERROR.code,
          Code.ACCESS_DENIED_ERROR.message,
          NestHttpExceptionFilter.isProduction ? null : error.cause,
        );
      } else if (error instanceof BadRequestException) {
        errorResponse = RestResponse.error(
          Code.BAD_REQUEST_ERROR.code,
          Code.BAD_REQUEST_ERROR.message,
          NestHttpExceptionFilter.isProduction ? null : error.cause,
        );
      } else {
        errorResponse = RestResponse.error(
          Code.INTERNAL_ERROR.code,
          Code.INTERNAL_ERROR.message,
          NestHttpExceptionFilter.isProduction ? null : error.cause,
        );
      }
    }

    return errorResponse;
  }

  private handleCoreException(
    error: Error,
    errorResponse: RestResponse<unknown>,
  ): RestResponse<unknown> {
    if (error instanceof Exception) {
      switch (error.code) {
        case Code.UNAUTHORIZED_ERROR.code:
        case Code.BAD_REQUEST_ERROR.code:
        case Code.ACCESS_DENIED_ERROR.code:
          errorResponse = RestResponse.error(
            error.code,
            error.message,
            NestHttpExceptionFilter.isProduction ? null : error.data,
          );
          break;
        case Code.USE_CASE_PORT_VALIDATION_ERROR.code:
          errorResponse = RestResponse.error(
            Code.BAD_REQUEST_ERROR.code,
            Code.BAD_REQUEST_ERROR.message,
            NestHttpExceptionFilter.isProduction ? null : error.data,
          );
          break;
      }
    }

    return errorResponse;
  }
}
