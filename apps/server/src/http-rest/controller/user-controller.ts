import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RestResponse } from "./dto/common/rest-response";
import { UserResponseDTO } from "./dto/user/user-response-dto";
import {
  Code,
  DeleteUserAdapter,
  DeleteUserUsecase,
  EditUserAdapter,
  EditUserGroupProfileAdapter,
  EditUserGroupProfileUsecase,
  EditUserUsecase,
  GetUserAdaptor,
  GetUserUsecase,
  IObjectStoragePort,
} from "@repo/be-core";
import { ApiResponseGeneric } from "./dto/decorator/api-response-generic";
import { RestEditUserBody } from "./dto/user/edit-user-body";
import { DiTokens } from "../../di/di-tokens";
import { HttpJwtAuthGuard } from "../auth/guard/jwt-auth-guard";
import { HttpGroupMemberGuard } from "../auth/guard/group-member-guard";
import { GetUserGroupProfileImageUploadUrlResponseDTO } from "./dto/user/get-user-group-profile-image-upload-url-response-dto";
import { GetProfileImageUploadUrlResponseDTO } from "./dto/user/get-profile-image-upload-url-response-dto copy";
import { EditUserGroupProfileBody } from "./dto/user/edit-user-group-profile-body";

@Controller("users")
@ApiTags("users")
export class UserController {
  constructor(
    @Inject(DiTokens.GetUserUsecase)
    private readonly getUserUsecase: GetUserUsecase,
    @Inject(DiTokens.DeleteUserUsecase)
    private readonly deleteUserUsecase: DeleteUserUsecase,
    @Inject(DiTokens.MediaObjectStorage)
    private readonly mediaObjectStorage: IObjectStoragePort,
    @Inject(DiTokens.EditUserUsecase)
    private readonly editUserUsecase: EditUserUsecase,
    @Inject(DiTokens.EditUserGroupProfileUsecase)
    private readonly editUserGroupProfileUsecase: EditUserGroupProfileUsecase,
  ) {}

  @Get(":userId")
  @UseGuards(HttpJwtAuthGuard)
  @ApiResponseGeneric({ code: Code.SUCCESS, data: UserResponseDTO })
  async getUser(
    @Param("userId") userId: string,
  ): Promise<RestResponse<UserResponseDTO>> {
    const adapter = await GetUserAdaptor.new({ id: userId });

    const user = await this.getUserUsecase.execute(adapter);

    const userDto = await UserResponseDTO.newFromUser(
      user,
      this.mediaObjectStorage,
    );
    return RestResponse.success(userDto);
  }

  @Delete(":userId")
  @UseGuards(HttpJwtAuthGuard)
  @ApiResponseGeneric({ code: Code.SUCCESS, data: null })
  async deleteUser(
    @Param("userId") userId: string,
  ): Promise<RestResponse<null>> {
    const adapter = await DeleteUserAdapter.new({ id: userId });

    await this.deleteUserUsecase.execute(adapter);

    return RestResponse.success(null);
  }

  @Patch(":userId")
  @UseGuards(HttpJwtAuthGuard)
  @ApiResponseGeneric({ code: Code.SUCCESS, data: UserResponseDTO })
  async editUser(
    @Param("userId") userId: string,
    @Body() body: RestEditUserBody,
  ): Promise<RestResponse<UserResponseDTO>> {
    const adapter = await EditUserAdapter.new({
      userId: userId,
      username: body.username,
    });

    const user = await this.editUserUsecase.execute(adapter);

    const dto = await UserResponseDTO.newFromUser(
      user,
      this.mediaObjectStorage,
    );
    return RestResponse.success(dto);
  }

  // TODO : email 변경 구현 (email 인증 구현 필요)
  @Patch(":userId/email")
  @UseGuards(HttpJwtAuthGuard)
  async editEmail() {}

  @Get(":userId/profile-image")
  @UseGuards(HttpJwtAuthGuard)
  @ApiResponseGeneric({
    code: Code.SUCCESS,
    data: GetProfileImageUploadUrlResponseDTO,
  })
  async getProfileImageUploadURL(
    @Param("userId") userId: string,
  ): Promise<RestResponse<GetProfileImageUploadUrlResponseDTO>> {
    const response = await GetProfileImageUploadUrlResponseDTO.new(
      userId,
      this.mediaObjectStorage,
    );

    return RestResponse.success(response);
  }

  // TODO : ObjectServer 웹훅 구현 필요
  @Patch(":userId/profile-image")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: UserResponseDTO })
  async editProfileImage() {}

  // user group profile 변경
  @Patch(":userId/profile/:groupId")
  @UseGuards(HttpJwtAuthGuard, HttpGroupMemberGuard)
  @ApiResponseGeneric({ code: Code.SUCCESS, data: UserResponseDTO })
  async editUserGroupProfile(
    @Param("userId") userId: string,
    @Param("groupId") groupId: string,
    @Body() body: EditUserGroupProfileBody,
  ): Promise<RestResponse<UserResponseDTO>> {
    const adapter = await EditUserGroupProfileAdapter.new({
      userId: userId,
      groupId: groupId,
      nickname: body.nickname,
    });

    const user = await this.editUserGroupProfileUsecase.execute(adapter);

    const dto = await UserResponseDTO.newFromUser(
      user,
      this.mediaObjectStorage,
    );
    return RestResponse.success(dto);
  }

  @Get(":userId/profile/:groupId/profile-image")
  @UseGuards(HttpJwtAuthGuard, HttpGroupMemberGuard)
  @ApiResponseGeneric({
    code: Code.SUCCESS,
    data: GetUserGroupProfileImageUploadUrlResponseDTO,
  })
  async getUserGroupProfileImageUploadURL(
    @Param("userId") userId: string,
    @Param("groupId") groupId: string,
  ): Promise<RestResponse<GetUserGroupProfileImageUploadUrlResponseDTO>> {
    const response = await GetUserGroupProfileImageUploadUrlResponseDTO.new(
      userId,
      groupId,
      this.mediaObjectStorage,
    );

    return RestResponse.success(response);
  }

  // TODO : ObjectServer 웹훅 구현 필요
  @Patch(":userId/profile/:groupId/profile-image")
  async editUserGroupProfileImage() {}
}
