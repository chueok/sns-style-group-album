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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RestResponse } from './dto/common/rest-response';
import {
  AcceptInvitationAdapter,
  AcceptInvitationUsecase,
  Code,
  CreateGroupAdapter,
  CreateGroupUsecase,
  DeleteGroupAdapter,
  DeleteGroupUsecase,
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
} from '@repo/be-core';
import { ApiResponseGeneric } from './dto/decorator/api-response-generic';
import { GroupSimpleResponseDTO } from './dto/group/group-simple-response';
import { GroupResponseDTO } from './dto/group/group-response';
import { CreateGroupBody } from './dto/group/create-group-body';
import { EditGroupBody } from './dto/group/edit-group-body';
import { UserSimpleResponseDTO } from './dto/user/user-simple-response-dto';
import { DiTokens } from '../../di/di-tokens';
import { VerifiedUser } from '../../auth/decorator/verified-user';
import { VerifiedUserPayload } from '../../auth/type/verified-user-payload';
import { HttpPermissionGuard } from '../../auth/guard/permission-guard';
import { Permission, PermissionEnum } from '../../auth/decorator/permission';

@Controller('groups')
@ApiTags('groups')
export class GroupController {
  constructor(
    @Inject(DiTokens.AcceptInvitationUsecase)
    private readonly acceptInvitationUsecase: AcceptInvitationUsecase,

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

    @Inject(DiTokens.DeleteGroupUsecase)
    private readonly deleteGroupUsecase: DeleteGroupUsecase
  ) {}

  @Patch(':groupId/accept-invitation')
  @UseGuards(HttpPermissionGuard)
  @ApiResponseGeneric({ code: Code.SUCCESS, data: null })
  async acceptInvitation(
    @VerifiedUser() verifiedUser: VerifiedUserPayload,
    @Param('groupId') groupId: string
  ): Promise<RestResponse<null>> {
    const adapter = await AcceptInvitationAdapter.new({
      groupId,
      userId: verifiedUser.id,
    });

    await this.acceptInvitationUsecase.execute(adapter);

    return RestResponse.success(null);
  }

  @Get('own')
  @UseGuards(HttpPermissionGuard)
  @ApiResponseGeneric({
    code: Code.SUCCESS,
    data: GroupSimpleResponseDTO,
    isArray: true,
  })
  async getOwnGroupList(
    @VerifiedUser() verifiedUser: VerifiedUserPayload
  ): Promise<RestResponse<GroupSimpleResponseDTO[]>> {
    const adapter = await GetOwnGroupListAdapter.new({
      userId: verifiedUser.id,
    });

    const groupList = await this.getOwnGroupListUsecase.execute(adapter);

    const dtos = GroupSimpleResponseDTO.newListFromGroups(groupList);

    return RestResponse.success(dtos);
  }

  @Get(':groupId/members')
  @UseGuards(HttpPermissionGuard)
  @Permission(PermissionEnum.GROUP_MEMBER)
  @ApiResponseGeneric({
    code: Code.SUCCESS,
    data: UserSimpleResponseDTO,
    isArray: true,
  })
  async getGroupMembers(
    @Param('groupId') groupId: string
  ): Promise<RestResponse<UserSimpleResponseDTO[]>> {
    const adapter = await GetGroupMembersAdaptor.new({
      groupId: groupId,
    });

    const userList = await this.getGroupMemberUsecase.execute(adapter);

    return RestResponse.success(userList);
  }

  @Get(':groupId')
  @UseGuards(HttpPermissionGuard)
  @Permission(PermissionEnum.GROUP_MEMBER)
  @ApiResponseGeneric({ code: Code.SUCCESS, data: GroupResponseDTO })
  async getGroup(
    @Param('groupId') groupId: string
  ): Promise<RestResponse<GroupResponseDTO>> {
    const adapter = await GetGroupAdapter.new({
      groupId,
    });

    const group = await this.getGroupUsecase.execute(adapter);

    const dto = GroupResponseDTO.newFromGroup(group);

    return RestResponse.success(dto);
  }

  @Patch(':groupId')
  @UseGuards(HttpPermissionGuard)
  @Permission(PermissionEnum.GROUP_OWNER)
  @ApiResponseGeneric({ code: Code.SUCCESS, data: GroupResponseDTO })
  async editGroup(
    @Param('groupId') groupId: string,
    @Body() body: EditGroupBody
  ): Promise<RestResponse<GroupResponseDTO>> {
    const trueCount = Object.keys(body)
      .map((key) => !!body[key])
      .filter(Boolean).length;
    if (trueCount > 1) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'Only one field can be edited at a time',
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
      dropOutUserList: body.dropOutUserList,
    });

    const group = await this.editGroupUsecase.execute(adapter);

    const dto = GroupResponseDTO.newFromGroup(group);

    return RestResponse.success(dto);
  }

  @Delete(':groupId')
  @UseGuards(HttpPermissionGuard)
  @Permission(PermissionEnum.GROUP_OWNER)
  @ApiResponseGeneric({ code: Code.SUCCESS, data: null })
  async deleteGroup(
    @Param('groupId') groupId: string
  ): Promise<RestResponse<null>> {
    const adapter = await DeleteGroupAdapter.new({ groupId });

    await this.deleteGroupUsecase.execute(adapter);

    return RestResponse.success(null);
  }

  @Post()
  @UseGuards(HttpPermissionGuard)
  @ApiResponseGeneric({ code: Code.CREATED, data: GroupResponseDTO })
  async createGroup(
    @VerifiedUser() verifiedUser: VerifiedUserPayload,
    @Body() body: CreateGroupBody
  ): Promise<RestResponse<GroupResponseDTO>> {
    const adapter = await CreateGroupAdapter.new({
      ownerId: verifiedUser.id,
      name: body.name,
    });

    const group = await this.createGroupUsecase.execute(adapter);

    const dto = GroupResponseDTO.newFromGroup(group);

    return RestResponse.success(dto);
  }

  @Get()
  @UseGuards(HttpPermissionGuard)
  @ApiResponseGeneric({
    code: Code.SUCCESS,
    data: GroupSimpleResponseDTO,
    isArray: true,
  })
  async getGroupList(
    @VerifiedUser() verifiedUser: VerifiedUserPayload
  ): Promise<RestResponse<GroupSimpleResponseDTO[]>> {
    const adapter = await GetGroupListAdapter.new({ userId: verifiedUser.id });

    const groupList = await this.getGroupListUsecase.execute(adapter);

    const dtos = GroupSimpleResponseDTO.newListFromGroups(groupList);

    return RestResponse.success(dtos);
  }
}
