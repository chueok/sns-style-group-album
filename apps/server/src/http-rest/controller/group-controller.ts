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
  CreateGroupAdapter,
  CreateGroupUsecase,
  EditGroupAdapter,
  EditGroupUsecase,
  Exception,
  GetGroupAdapter,
  GetGroupListAdapter,
  GetGroupListUsecase,
  GetGroupMembersAdaptor,
  GetGroupMembersUsecase,
  GetGroupUsecase,
  GetOwnGroupListAdapter,
  GetOwnGroupListUsecase,
  InviteUserAdapter,
  InviteUserUsecase,
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
import { VerifiedUser } from "../auth/decorator/verified-user";
import { VerifiedUserPayload } from "../auth/type/verified-user-payload";
import { HttpGroupOwnerGuard } from "../auth/guard/group-owner-guard";

@Controller("groups")
@ApiTags("groups")
export class GroupController {
  constructor(
    @Inject(DiTokens.GetGroupUsecase)
    private readonly getGroupUsecase: GetGroupUsecase,

    @Inject(DiTokens.GetGroupListUsecase)
    private readonly getGroupListUsecase: GetGroupListUsecase,

    @Inject(DiTokens.GetOwnGroupListUsecase)
    private readonly getOwnGroupListUsecase: GetOwnGroupListUsecase,

    @Inject(DiTokens.GetGroupMemberUsecase)
    private readonly getGroupMemberUsecase: GetGroupMembersUsecase,

    @Inject(DiTokens.EditGroupUsecase)
    private readonly editGroupUsecase: EditGroupUsecase,

    @Inject(DiTokens.InviteUserUsecase)
    private readonly inviteUserUsecase: InviteUserUsecase,

    @Inject(DiTokens.CreateGroupUsecase)
    private readonly createGroupUsecase: CreateGroupUsecase,
  ) {}

  @Get("own")
  @UseGuards(HttpJwtAuthGuard)
  @ApiResponseGeneric({
    code: Code.SUCCESS,
    data: GroupSimpleResponseDTO,
    isArray: true,
  })
  async getOwnGroupList(
    @VerifiedUser() verifiedUser: VerifiedUserPayload,
  ): Promise<RestResponse<GroupSimpleResponseDTO[]>> {
    const adapter = await GetOwnGroupListAdapter.new({
      userId: verifiedUser.id,
    });

    const groupList = await this.getOwnGroupListUsecase.execute(adapter);

    const dtos = GroupSimpleResponseDTO.newListFromGroups(groupList);

    return RestResponse.success(dtos);
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

  @Patch(":groupId")
  @UseGuards(HttpJwtAuthGuard, HttpGroupOwnerGuard)
  @ApiResponseGeneric({ code: Code.SUCCESS, data: GroupResponseDTO })
  async editGroup(
    @Param("groupId") groupId: string,
    @Body() body: RestEditGroupBody,
  ): Promise<RestResponse<GroupResponseDTO>> {
    const trueCount = Object.keys(body)
      .map((key) => !!body[key])
      .filter(Boolean).length;
    if (trueCount > 1) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: "Only one field can be edited at a time",
      });
    }

    if (body?.invitedUserList) {
      const adapter = await InviteUserAdapter.new({
        groupId,
        invitedUserList: body.invitedUserList,
      });

      const group = await this.inviteUserUsecase.execute(adapter);

      const dto = GroupResponseDTO.newFromGroup(group);

      return RestResponse.success(dto);
    }

    const adapter = await EditGroupAdapter.new({
      groupId,
      ownerId: body.ownerId,
      name: body.name,
    });

    const group = await this.editGroupUsecase.execute(adapter);

    const dto = GroupResponseDTO.newFromGroup(group);

    return RestResponse.success(dto);
  }

  @Delete(":groupId")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: null })
  async deleteGroup(
    @Param("groupId") groupId: string,
  ): Promise<RestResponse<null>> {
    throw new Error("Not implemented");
  }

  @Post()
  @UseGuards(HttpJwtAuthGuard)
  @ApiResponseGeneric({ code: Code.CREATED, data: GroupResponseDTO })
  async createGroup(
    @VerifiedUser() verifiedUser: VerifiedUserPayload,
    @Body() body: RestCreateGroupBody,
  ): Promise<RestResponse<GroupResponseDTO | null>> {
    const adapter = await CreateGroupAdapter.new({
      ownerId: verifiedUser.id,
      name: body.name,
    });

    const group = await this.createGroupUsecase.execute(adapter);

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
}
