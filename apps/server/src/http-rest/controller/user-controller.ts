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
import { RestResponseUserDetail } from "./documentation/user/response-user-detail";
import { RestResponseUserSymple } from "./documentation/user/response-user-symple";
import { Code } from "@repo/be-core";
import { ApiResponseGeneric } from "./documentation/common/decorator/api-response-generic";
import { RestEditUserBody } from "./documentation/user/edit-user-body";

@Controller("users")
@ApiTags("users")
export class UserController {
  @Get(":userId")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: RestResponseUserDetail })
  async getUser(
    @Param("userId") userId: string,
  ): Promise<RestResponse<RestResponseUserDetail | null>> {
    throw new Error("Not implemented");
  }

  @Get()
  @ApiResponseGeneric({
    code: Code.SUCCESS,
    data: RestResponseUserSymple,
    isArray: true,
  })
  async getUserList(
    @Query() query: RestGetUserListQuery,
  ): Promise<RestResponse<RestResponseUserSymple[] | null>> {
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
  @ApiResponseGeneric({ code: Code.SUCCESS, data: RestResponseUserDetail })
  async editUser(
    @Param("userId") userId: string,
    @Body() body: RestEditUserBody,
  ): Promise<RestResponse<RestResponseUserDetail | null>> {
    throw new Error("Not implemented");
  }
}
