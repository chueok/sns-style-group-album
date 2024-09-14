import { applyDecorators } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";
import { RestResponse } from "../rest-response";
import { Code, Constructor } from "@repo/be-core";

export const ApiResponseOkGeneric = <
  GenericType extends Constructor<unknown> | null,
>(payload: {
  data: GenericType;
}) => {
  const { data } = payload;
  const models: any[] = [RestResponse];
  if (data) {
    models.push(data);
  }

  return applyDecorators(
    ApiExtraModels(...models),
    ApiOkResponse({
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
                default: Code.SUCCESS.code,
              },
            },
          },
        ],
      },
    }),
  );
};
