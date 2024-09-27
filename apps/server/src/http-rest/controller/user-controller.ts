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
import { RestResponse } from "./documentation/common/rest-response";
import { UserResponseDto } from "./documentation/user/user-response";
import {
  Code,
  DeleteUserAdapter,
  DeleteUserUsecase,
  GetUserAdaptor,
  GetUserUsecase,
  IObjectStoragePort,
} from "@repo/be-core";
import { ApiResponseGeneric } from "./documentation/decorator/api-response-generic";
import { RestEditUserBody } from "./documentation/user/edit-user-body";
import { DiTokens } from "../../di/di-tokens";
import { HttpJwtAuthGuard } from "../auth/guard/jwt-auth-guard";
import { EditProfileImageResponse } from "./documentation/user/edit-profile-image-response";

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
  ) {}

  @Get(":userId")
  @UseGuards(HttpJwtAuthGuard)
  @ApiResponseGeneric({ code: Code.SUCCESS, data: UserResponseDto })
  async getUser(
    @Param("userId") userId: string,
  ): Promise<RestResponse<UserResponseDto>> {
    const adapter = await GetUserAdaptor.new({ id: userId });

    const user = await this.getUserUsecase.execute(adapter);

    const userDto = await UserResponseDto.newFromUser(
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
  @ApiResponseGeneric({ code: Code.SUCCESS, data: UserResponseDto })
  async editUser(
    @Param("userId") userId: string,
    @Body() body: RestEditUserBody,
  ): Promise<RestResponse<UserResponseDto | null>> {
    throw new Error("Not implemented");
  }

  // TODO : profile 사진 변경은 별도 API로 분리 (presigned url 제공)
  @Patch(":userId/profile-image")
  @UseGuards(HttpJwtAuthGuard)
  @ApiResponseGeneric({ code: Code.SUCCESS, data: EditProfileImageResponse })
  async editProfileImage(
    @Param("userId") userId: string,
  ): Promise<RestResponse<EditProfileImageResponse>> {
    throw new Error("Not implemented");
  }
}
