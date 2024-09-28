import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RestResponse } from "./dto/common/rest-response";
import {
  Code,
  GetGroupAdapter,
  GetGroupListAdapter,
  GetGroupListUsecase,
  GetGroupMembersAdaptor,
  GetGroupMembersUsecase,
  GetGroupUsecase,
} from "@repo/be-core";
import { ApiResponseGeneric } from "./dto/decorator/api-response-generic";
import { GroupSimpleResponseDTO } from "./dto/group/group-simple-response";
import { GroupResponseDTO } from "./dto/group/group-response";
import { RestCreateGroupBody } from "./dto/group/create-group-body";
import { RestEditGroupBody } from "./dto/group/edit-group-body";
import { HttpJwtAuthGuard } from "../auth/guard/jwt-auth-guard";
import { HttpGroupMemberGuard } from "../auth/guard/group-member-guard";
import { UserSimpleResponseDTO } from "./dto/user/user-simple-response-dto";
import { DiTokens } from "../../di/di-tokens";
import { HttpGroupOwnerGuard } from "../auth/guard/group-owner-guard";
import { VerifiedUser } from "../auth/decorator/verified-user";
import { VerifiedUserPayload } from "../auth/type/verified-user-payload";

@Controller("groups")
@ApiTags("groups")
export class GroupController {
  constructor(
    @Inject(DiTokens.GetGroupMemberUsecase)
    private readonly getGroupMemberUsecase: GetGroupMembersUsecase,

    @Inject(DiTokens.GetGroupUsecase)
    private readonly getGroupUsecase: GetGroupUsecase,

    @Inject(DiTokens.GetGroupListUsecase)
    private readonly getGroupListUsecase: GetGroupListUsecase,
  ) {}

  @Get(":groupId")
  @UseGuards(HttpJwtAuthGuard, HttpGroupMemberGuard)
  @ApiResponseGeneric({ code: Code.SUCCESS, data: GroupResponseDTO })
  async getGroup(
    @Param("groupId") groupId: string,
  ): Promise<RestResponse<GroupResponseDTO>> {
    const adapter = await GetGroupAdapter.new({
      groupId,
    });
    const group = await this.getGroupUsecase.execute(adapter);
    const dto = GroupResponseDTO.newFromGroup(group);

    return RestResponse.success(dto);
  }

  @Get()
  @UseGuards(HttpJwtAuthGuard)
  @ApiResponseGeneric({
    code: Code.SUCCESS,
    data: GroupSimpleResponseDTO,
    isArray: true,
  })
  async getGroupList(
    @VerifiedUser() verifiedUser: VerifiedUserPayload,
  ): Promise<RestResponse<GroupSimpleResponseDTO[]>> {
    const adapter = await GetGroupListAdapter.new({ userId: verifiedUser.id });

    const groupList = await this.getGroupListUsecase.execute(adapter);

    const dtos = GroupSimpleResponseDTO.newListFromGroups(groupList);

    return RestResponse.success(dtos);
  }

  @Get("own")
  @UseGuards(HttpJwtAuthGuard, HttpGroupOwnerGuard)
  @ApiResponseGeneric({
    code: Code.SUCCESS,
    data: GroupSimpleResponseDTO,
    isArray: true,
  })
  async getOwnGroupList(): Promise<GroupSimpleResponseDTO[]> {
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
  @ApiResponseGeneric({ code: Code.SUCCESS, data: GroupResponseDTO })
  async editGroup(
    @Param("groupId") groupId: string,
    @Body() body: RestEditGroupBody,
  ): Promise<RestResponse<GroupResponseDTO | null>> {
    throw new Error("Not implemented");
  }

  @Post()
  @ApiResponseGeneric({ code: Code.CREATED, data: GroupResponseDTO })
  async createGroup(
    @Body() body: RestCreateGroupBody,
  ): Promise<RestResponse<GroupResponseDTO | null>> {
    throw new Error("Not implemented");
  }

  @Get(":groupId/members")
  @UseGuards(HttpJwtAuthGuard, HttpGroupMemberGuard)
  @ApiResponseGeneric({
    code: Code.SUCCESS,
    data: UserSimpleResponseDTO,
    isArray: true,
  })
  async getGroupMembers(
    @Param("groupId") groupId: string,
  ): Promise<RestResponse<UserSimpleResponseDTO[]>> {
    const adapter = await GetGroupMembersAdaptor.new({
      groupId: groupId,
    });

    const userList = await this.getGroupMemberUsecase.execute(adapter);

    return RestResponse.success(userList);
  }
}
