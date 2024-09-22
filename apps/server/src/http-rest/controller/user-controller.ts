import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RestGetUserListQuery } from "./documentation/user/get-user-list-query";
import { RestResponse } from "./documentation/common/rest-response";
import { RestUserResponse } from "./documentation/user/user-response";
import { RestUserSimpleResponse } from "./documentation/user/user-simple-response";
import { Code } from "@repo/be-core";
import { ApiResponseGeneric } from "./documentation/decorator/api-response-generic";
import { RestEditUserBody } from "./documentation/user/edit-user-body";

@Controller("users")
@ApiTags("users")
export class UserController {
  @Get(":userId")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: RestUserResponse })
  async getUser(
    @Param("userId") userId: string,
  ): Promise<RestResponse<RestUserResponse | null>> {
    throw new Error("Not implemented");
  }

  @Get()
  @ApiResponseGeneric({
    code: Code.SUCCESS,
    data: RestUserSimpleResponse,
    isArray: true,
  })
  async getUserList(
    @Query() query: RestGetUserListQuery,
  ): Promise<RestResponse<RestUserSimpleResponse[] | null>> {
    throw new Error("Not implemented");
  }

  @Delete(":userId")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: null })
  async deleteUser(
    @Param("userId") userId: string,
  ): Promise<RestResponse<null>> {
    throw new Error("Not implemented");
  }

  // TODO : profile 사진 변경 구현 필요
  @Patch(":userId")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: RestUserResponse })
  async editUser(
    @Param("userId") userId: string,
    @Body() body: RestEditUserBody,
  ): Promise<RestResponse<RestUserResponse | null>> {
    throw new Error("Not implemented");
  }
}
