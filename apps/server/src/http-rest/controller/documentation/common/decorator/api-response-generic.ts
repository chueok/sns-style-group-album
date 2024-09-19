import { applyDecorators } from "@nestjs/common";
import { ApiExtraModels, ApiResponse, getSchemaPath } from "@nestjs/swagger";
import { RestResponse } from "../rest-response";
import { CodeDescription, Constructor } from "@repo/be-core";

export const ApiResponseGeneric = <
  GenericType extends Constructor<unknown> | null,
>(payload: {
  code: CodeDescription;
  data: GenericType;
  description?: string;
}) => {
  const { code, data, description } = payload;
  const models: any[] = [RestResponse];
  if (data) {
    models.push(data);
  }

  return applyDecorators(
    ApiExtraModels(...models),
    ApiResponse({
      status: code.code,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(RestResponse) },
          {
            properties: {
              data: data
                ? {
                    $ref: getSchemaPath(data),
                  }
                : {
                    default: null,
                  },
              code: {
                default: code.code,
              },
              message: {
                default: code.message,
              },
              timestamp: {
                default: Date.now(),
              },
            },
          },
        ],
      },
    }),
  );
};
