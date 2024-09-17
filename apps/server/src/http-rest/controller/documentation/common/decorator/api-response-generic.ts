import { applyDecorators } from "@nestjs/common";
import { ApiExtraModels, ApiResponse, getSchemaPath } from "@nestjs/swagger";
import { RestResponse } from "../rest-response";
import { CodeDescription, Constructor } from "@repo/be-core";

export const ApiResponseGeneric = <
  GenericType extends Constructor<unknown> | null,
>(payload: {
  code: CodeDescription;
  data: GenericType;
}) => {
  const { code, data } = payload;
  const models: any[] = [RestResponse];
  if (data) {
    models.push(data);
  }

  return applyDecorators(
    ApiExtraModels(...models),
    ApiResponse({
      status: code.code,
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
            },
          },
        ],
      },
    }),
  );
};
