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
import { VerifiedUser } from "../auth/decorator/verified-user";
import { VerifiedUserPayload } from "../auth/type/verified-user-payload";

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

  @Get()
  @UseGuards(HttpJwtAuthGuard)
  @ApiResponseGeneric({ code: Code.SUCCESS, data: UserResponseDTO })
  async getUser(
    @VerifiedUser() verifiedUser: VerifiedUserPayload,
  ): Promise<RestResponse<UserResponseDTO>> {
    const adapter = await GetUserAdaptor.new({ id: verifiedUser.id });

    const user = await this.getUserUsecase.execute(adapter);

    const userDto = await UserResponseDTO.newFromUser(
      user,
      this.mediaObjectStorage,
    );
    return RestResponse.success(userDto);
  }

  @Delete()
  @UseGuards(HttpJwtAuthGuard)
  @ApiResponseGeneric({ code: Code.SUCCESS, data: null })
  async deleteUser(
    @VerifiedUser() verifiedUser: VerifiedUserPayload,
  ): Promise<RestResponse<null>> {
    const adapter = await DeleteUserAdapter.new({ id: verifiedUser.id });

    await this.deleteUserUsecase.execute(adapter);

    return RestResponse.success(null);
  }

  @Patch()
  @UseGuards(HttpJwtAuthGuard)
  @ApiResponseGeneric({ code: Code.SUCCESS, data: UserResponseDTO })
  async editUser(
    @VerifiedUser() verifiedUser: VerifiedUserPayload,
    @Body() body: RestEditUserBody,
  ): Promise<RestResponse<UserResponseDTO>> {
    const adapter = await EditUserAdapter.new({
      userId: verifiedUser.id,
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
  @Patch("email")
  @UseGuards(HttpJwtAuthGuard)
  async editEmail() {}

  @Get("profile-image-upload-url")
  @UseGuards(HttpJwtAuthGuard)
  @ApiResponseGeneric({
    code: Code.SUCCESS,
    data: GetProfileImageUploadUrlResponseDTO,
  })
  async getProfileImageUploadURL(
    @VerifiedUser() verifiedUser: VerifiedUserPayload,
  ): Promise<RestResponse<GetProfileImageUploadUrlResponseDTO>> {
    const response = await GetProfileImageUploadUrlResponseDTO.new(
      verifiedUser.id,
      this.mediaObjectStorage,
    );

    return RestResponse.success(response);
  }

  // TODO : ObjectServer 웹훅 구현 필요
  @Patch(":userId/profile-image")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: UserResponseDTO })
  async editProfileImage() {}

  // user group profile 변경
  @Patch("profile/:groupId")
  @UseGuards(HttpJwtAuthGuard, HttpGroupMemberGuard)
  @ApiResponseGeneric({ code: Code.SUCCESS, data: UserResponseDTO })
  async editUserGroupProfile(
    @VerifiedUser() verifiedUser: VerifiedUserPayload,
    @Param("groupId") groupId: string,
    @Body() body: EditUserGroupProfileBody,
  ): Promise<RestResponse<UserResponseDTO>> {
    const adapter = await EditUserGroupProfileAdapter.new({
      userId: verifiedUser.id,
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

  @Get("profile/:groupId/profile-image-upload-url")
  @UseGuards(HttpJwtAuthGuard, HttpGroupMemberGuard)
  @ApiResponseGeneric({
    code: Code.SUCCESS,
    data: GetUserGroupProfileImageUploadUrlResponseDTO,
  })
  async getUserGroupProfileImageUploadURL(
    @VerifiedUser() verifiedUser: VerifiedUserPayload,
    @Param("groupId") groupId: string,
  ): Promise<RestResponse<GetUserGroupProfileImageUploadUrlResponseDTO>> {
    const response = await GetUserGroupProfileImageUploadUrlResponseDTO.new(
      verifiedUser.id,
      groupId,
      this.mediaObjectStorage,
    );

    return RestResponse.success(response);
  }

  // TODO : ObjectServer 웹훅 구현 필요
  @Patch(":userId/profile/:groupId/profile-image")
  async editUserGroupProfileImage() {}
}
