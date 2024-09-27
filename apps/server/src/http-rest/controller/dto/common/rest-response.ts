import { ApiProperty } from "@nestjs/swagger";
import { Code, Nullable } from "@repo/be-core";

export class RestResponse<TData = unknown> {
  @ApiProperty({ type: "number" })
  public readonly code: number;

  @ApiProperty({ type: "string" })
  public readonly message: string;

  @ApiProperty({ description: "timestamp in ms", type: "number" })
  public readonly timestamp: number;

  @ApiProperty({ type: "object", nullable: true })
  public readonly data: Nullable<TData>;

  private constructor(code: number, message: string, data?: TData) {
    this.code = code;
    this.message = message;
    this.data = data || null;
    this.timestamp = Date.now();
  }

  public static success<TData>(
    data?: TData,
    message?: string,
  ): RestResponse<TData> {
    const resultCode: number = Code.SUCCESS.code;
    const resultMessage: string = message || Code.SUCCESS.message;

    return new RestResponse(resultCode, resultMessage, data);
  }

  public static error<TData>(
    code?: number,
    message?: string,
    data?: TData,
  ): RestResponse<TData> {
    const resultCode: number = code || Code.INTERNAL_ERROR.code;
    const resultMessage: string = message || Code.INTERNAL_ERROR.message;

    return new RestResponse(resultCode, resultMessage, data);
  }
}
