import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RestResponse } from "./documentation/common/rest-response";
import {
  Code,
  GetGroupMembersAdaptor,
  GetGroupMembersUsecase,
} from "@repo/be-core";
import { ApiResponseGeneric } from "./documentation/decorator/api-response-generic";
import { RestGetGroupListQuery } from "./documentation/group/get-group-list-query";
import { RestGroupSimpleResponse } from "./documentation/group/group-simple-response";
import { RestGroupResponse } from "./documentation/group/group-response";
import { RestCreateGroupBody } from "./documentation/group/create-group-body";
import { RestEditGroupBody } from "./documentation/group/edit-group-body";
import { HttpJwtAuthGuard } from "../auth/guard/jwt-auth-guard";
import { HttpGroupMemberGuard } from "../auth/guard/group-member-guard";
import { RestUserSimpleResponse } from "./documentation/user/user-simple-response";
import { DiTokens } from "../../di/di-tokens";

@Controller("groups")
@ApiTags("groups")
export class GroupController {
  constructor(
    @Inject(DiTokens.GetUserListByGroupIdUsecase)
    private readonly getUserListByGroupIdUsecase: GetGroupMembersUsecase,
  ) {}

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

  @Get(":groupId/members")
  @UseGuards(HttpJwtAuthGuard, HttpGroupMemberGuard)
  @ApiResponseGeneric({
    code: Code.SUCCESS,
    data: RestUserSimpleResponse,
    isArray: true,
  })
  async getGroupMembers(
    @Param("groupId") groupId: string,
  ): Promise<RestResponse<RestUserSimpleResponse[]>> {
    const adapter = await GetGroupMembersAdaptor.new({
      groupId: groupId,
    });

    const userList = await this.getUserListByGroupIdUsecase.execute(adapter);

    return RestResponse.success(userList);
  }
}
