import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RestResponse } from "./documentation/common/rest-response";
import { Code } from "@repo/be-core";
import { ApiResponseGeneric } from "./documentation/decorator/api-response-generic";
import { RestGetGroupListQuery } from "./documentation/group/get-group-list-query";
import { RestGroupSimpleResponse } from "./documentation/group/group-simple-response";
import { RestGroupResponse } from "./documentation/group/group-response";
import { RestCreateGroupBody } from "./documentation/group/create-group-body";
import { RestEditGroupBody } from "./documentation/group/edit-group-body";

@Controller("groups")
@ApiTags("groups")
export class GroupController {
  @Get(":groupId")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: RestGroupResponse })
  async getGroup(
    @Param("groupId") groupId: string,
  ): Promise<RestResponse<RestGroupResponse | null>> {
    throw new Error("Not implemented");
  }

  @Get()
  @ApiResponseGeneric({
    code: Code.SUCCESS,
    data: RestGroupSimpleResponse,
    isArray: true,
  })
  async getGroupList(
    @Query() query: RestGetGroupListQuery,
  ): Promise<RestGroupSimpleResponse[] | null> {
    throw new Error("Not implemented");
  }

  @Delete(":groupId")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: null })
  async deleteGroup(
    @Param("groupId") groupId: string,
  ): Promise<RestResponse<null>> {
    throw new Error("Not implemented");
  }

  @Patch(":groupId")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: RestGroupResponse })
  async editGroup(
    @Param("groupId") groupId: string,
    @Body() body: RestEditGroupBody,
  ): Promise<RestResponse<RestGroupResponse | null>> {
    throw new Error("Not implemented");
  }

  @Post()
  @ApiResponseGeneric({ code: Code.CREATED, data: RestGroupResponse })
  async createGroup(
    @Body() body: RestCreateGroupBody,
  ): Promise<RestResponse<RestGroupResponse | null>> {
    throw new Error("Not implemented");
  }
}
