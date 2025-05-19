import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RestResponse } from './dto/common/rest-response';
import { UserResponseDTO } from './dto/user/user-response-dto';
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
} from '@repo/be-core';
import { ApiResponseGeneric } from '../../swagger/decorator/api-response-generic';
import { EditUserBody } from './dto/user/edit-user-body';
import { DiTokens } from '../../di/di-tokens';
import { GetUserGroupProfileImageUploadUrlResponseDTO } from './dto/user/get-user-group-profile-image-upload-url-response-dto';
import { GetProfileImageUploadUrlResponseDTO } from './dto/user/get-profile-image-upload-url-response-dto';
import { UserGroupProfileBody } from './dto/user/edit-user-group-profile-body';
import { TJwtUser } from '../../auth/type/jwt-user';
import { DJwtUser } from '../../auth/decorator/jwt-user';

@Controller('users')
@ApiTags('users')
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
    private readonly editUserGroupProfileUsecase: EditUserGroupProfileUsecase
  ) {}

  @Get()
  @ApiResponseGeneric({ code: Code.SUCCESS, data: UserResponseDTO })
  async getUser(
    @DJwtUser() jwtUser: TJwtUser
  ): Promise<RestResponse<UserResponseDTO>> {
    const adapter = await GetUserAdaptor.new({ id: jwtUser.id });

    const user = await this.getUserUsecase.execute(adapter);

    const userDto = await UserResponseDTO.newFromUser(
      user,
      this.mediaObjectStorage
    );
    return RestResponse.success(userDto);
  }

  @Delete()
  @ApiResponseGeneric({ code: Code.SUCCESS, data: null })
  async deleteUser(@DJwtUser() jwtUser: TJwtUser): Promise<RestResponse<null>> {
    const adapter = await DeleteUserAdapter.new({ id: jwtUser.id });

    await this.deleteUserUsecase.execute(adapter);

    return RestResponse.success(null);
  }

  @Patch()
  @ApiResponseGeneric({ code: Code.SUCCESS, data: UserResponseDTO })
  async editUser(
    @DJwtUser() jwtUser: TJwtUser,
    @Body() body: EditUserBody
  ): Promise<RestResponse<UserResponseDTO>> {
    const adapter = await EditUserAdapter.new({
      userId: jwtUser.id,
      username: body.username,
    });

    const user = await this.editUserUsecase.execute(adapter);

    const dto = await UserResponseDTO.newFromUser(
      user,
      this.mediaObjectStorage
    );
    return RestResponse.success(dto);
  }

  // TODO : email 변경 구현 (email 인증 구현 필요)
  @Patch('email')
  async editEmail() {}

  @Get('profile-image-upload-url')
  @ApiResponseGeneric({
    code: Code.SUCCESS,
    data: GetProfileImageUploadUrlResponseDTO,
  })
  async getProfileImageUploadURL(
    @DJwtUser() jwtUser: TJwtUser
  ): Promise<RestResponse<GetProfileImageUploadUrlResponseDTO>> {
    const response = await GetProfileImageUploadUrlResponseDTO.new(
      jwtUser.id,
      this.mediaObjectStorage
    );

    return RestResponse.success(response);
  }

  // TODO : ObjectServer 웹훅 구현 필요
  @Patch(':userId/profile-image')
  @ApiResponseGeneric({ code: Code.SUCCESS, data: UserResponseDTO })
  async editProfileImage() {}

  // user group profile 변경
  @Patch('profile/:groupId')
  @ApiResponseGeneric({ code: Code.SUCCESS, data: UserResponseDTO })
  async editUserGroupProfile(
    @DJwtUser() jwtUser: TJwtUser,
    @Param('groupId') groupId: string,
    @Body() body: UserGroupProfileBody
  ): Promise<RestResponse<UserResponseDTO>> {
    const adapter = await EditUserGroupProfileAdapter.new({
      userId: jwtUser.id,
      groupId: groupId,
      nickname: body.nickname,
    });

    const user = await this.editUserGroupProfileUsecase.execute(adapter);

    const dto = await UserResponseDTO.newFromUser(
      user,
      this.mediaObjectStorage
    );
    return RestResponse.success(dto);
  }

  @Get('profile/:groupId/profile-image-upload-url')
  @ApiResponseGeneric({
    code: Code.SUCCESS,
    data: GetUserGroupProfileImageUploadUrlResponseDTO,
  })
  async getUserGroupProfileImageUploadURL(
    @DJwtUser() jwtUser: TJwtUser,
    @Param('groupId') groupId: string
  ): Promise<RestResponse<GetUserGroupProfileImageUploadUrlResponseDTO>> {
    const response = await GetUserGroupProfileImageUploadUrlResponseDTO.new(
      jwtUser.id,
      groupId,
      this.mediaObjectStorage
    );

    return RestResponse.success(response);
  }

  // TODO : ObjectServer 웹훅 구현 필요
  @Patch(':userId/profile/:groupId/profile-image')
  async editUserGroupProfileImage() {}
}
