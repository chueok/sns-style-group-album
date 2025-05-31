// import {
//   Body,
//   Controller,
//   Delete,
//   Get,
//   Inject,
//   Param,
//   Patch,
// } from '@nestjs/common';
// import { ApiTags } from '@nestjs/swagger';
// import { RestResponse } from '../http-rest/controller/dto/common/rest-response';
// import { UserService } from '@repo/be-core';
// import { EditUserBody } from '../http-rest/controller/dto/user/edit-user-body';
// import { GetUserGroupProfileImageUploadUrlResponseDTO } from '../http-rest/controller/dto/user/get-user-group-profile-image-upload-url-response-dto';
// import { GetProfileImageUploadUrlResponseDTO } from '../http-rest/controller/dto/user/get-profile-image-upload-url-response-dto';
// import { UserGroupProfileBody } from '../http-rest/controller/dto/user/edit-user-group-profile-body';
// import { TJwtUser } from '../auth/type/jwt-user';
// import { DJwtUser } from '../auth/decorator/jwt-user';

// @Controller('users')
// @ApiTags('users')
// export class UserController {
//   constructor(private readonly userService: UserService) {}

//   @Get()
//   async getUser(
//     @DJwtUser() jwtUser: TJwtUser
//   ): Promise<RestResponse<UserResponseDTO>> {
//     const user = await this.userService.getUser(jwtUser.id);

//     const userDto = await UserResponseDTO.newFromUser(
//       user,
//       this.mediaObjectStorage
//     );
//     return RestResponse.success(userDto);
//   }

//   @Delete()
//   async deleteUser(@DJwtUser() jwtUser: TJwtUser): Promise<RestResponse<null>> {
//     const adapter = await DeleteUserAdapter.new({ id: jwtUser.id });

//     await this.deleteUserUsecase.execute(adapter);

//     return RestResponse.success(null);
//   }

//   @Patch()
//   async editUser(
//     @DJwtUser() jwtUser: TJwtUser,
//     @Body() body: EditUserBody
//   ): Promise<RestResponse<UserResponseDTO>> {
//     const adapter = await EditUserAdapter.new({
//       userId: jwtUser.id,
//       username: body.username,
//     });

//     const user = await this.editUserUsecase.execute(adapter);

//     const dto = await UserResponseDTO.newFromUser(
//       user,
//       this.mediaObjectStorage
//     );
//     return RestResponse.success(dto);
//   }

//   // TODO : email 변경 구현 (email 인증 구현 필요)
//   @Patch('email')
//   async editEmail() {}

//   @Get('profile-image-upload-url')
//   async getProfileImageUploadURL(
//     @DJwtUser() jwtUser: TJwtUser
//   ): Promise<RestResponse<GetProfileImageUploadUrlResponseDTO>> {
//     const response = await GetProfileImageUploadUrlResponseDTO.new(
//       jwtUser.id,
//       this.mediaObjectStorage
//     );

//     return RestResponse.success(response);
//   }

//   // TODO : ObjectServer 웹훅 구현 필요
//   @Patch(':userId/profile-image')
//   async editProfileImage() {}

//   // user group profile 변경
//   @Patch('profile/:groupId')
//   async editUserGroupProfile(
//     @DJwtUser() jwtUser: TJwtUser,
//     @Param('groupId') groupId: string,
//     @Body() body: UserGroupProfileBody
//   ): Promise<RestResponse<UserResponseDTO>> {
//     const adapter = await EditUserGroupProfileAdapter.new({
//       userId: jwtUser.id,
//       groupId: groupId,
//       nickname: body.nickname,
//     });

//     const user = await this.editUserGroupProfileUsecase.execute(adapter);

//     const dto = await UserResponseDTO.newFromUser(
//       user,
//       this.mediaObjectStorage
//     );
//     return RestResponse.success(dto);
//   }

//   @Get('profile/:groupId/profile-image-upload-url')
//   async getUserGroupProfileImageUploadURL(
//     @DJwtUser() jwtUser: TJwtUser,
//     @Param('groupId') groupId: string
//   ): Promise<RestResponse<GetUserGroupProfileImageUploadUrlResponseDTO>> {
//     const response = await GetUserGroupProfileImageUploadUrlResponseDTO.new(
//       jwtUser.id,
//       groupId,
//       this.mediaObjectStorage
//     );

//     return RestResponse.success(response);
//   }

//   // TODO : ObjectServer 웹훅 구현 필요
//   @Patch(':userId/profile/:groupId/profile-image')
//   async editUserGroupProfileImage() {}
// }
