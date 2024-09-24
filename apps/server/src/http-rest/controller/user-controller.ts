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
import { RestUserResponse } from "./documentation/user/user-response";
import {
  Code,
  DeleteUserAdapter,
  DeleteUserUsecase,
  GetUserAdaptor,
  GetUserUsecase,
} from "@repo/be-core";
import { ApiResponseGeneric } from "./documentation/decorator/api-response-generic";
import { RestEditUserBody } from "./documentation/user/edit-user-body";
import { DiTokens } from "../../di/di-tokens";
import { HttpJwtAuthGuard } from "../auth/guard/jwt-auth-guard";

@Controller("users")
@ApiTags("users")
export class UserController {
  constructor(
    @Inject(DiTokens.GetUserUsecase)
    private readonly getUserUsecase: GetUserUsecase,
    @Inject(DiTokens.DeleteUserUsecase)
    private readonly deleteUserUsecase: DeleteUserUsecase,
  ) {}

  @Get(":userId")
  @UseGuards(HttpJwtAuthGuard)
  @ApiResponseGeneric({ code: Code.SUCCESS, data: RestUserResponse })
  async getUser(
    @Param("userId") userId: string,
  ): Promise<RestResponse<RestUserResponse>> {
    const adapter = await GetUserAdaptor.new({ id: userId });

    const user = await this.getUserUsecase.execute(adapter);

    return RestResponse.success(user);
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

  // TODO : profile 사진 변경 구현 필요
  @Patch(":userId")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: RestUserResponse })
  async editUser(
    @Param("userId") userId: string,
    @Body() body: RestEditUserBody,
  ): Promise<RestResponse<RestUserResponse | null>> {
    throw new Error("Not implemented");
  }
}
