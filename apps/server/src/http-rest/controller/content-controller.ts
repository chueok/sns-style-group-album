import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RestResponse } from "./documentation/common/rest-response";
import { Code } from "@repo/be-core";
import { ApiResponseGeneric } from "./documentation/decorator/api-response-generic";
import { RestGetContentListQuery } from "./documentation/content/get-content-list-query";
import { RestContentResponse } from "./documentation/content/content-response";
import { RestEditContentBody } from "./documentation/content/edit-content-body";
import { RestCreateContentBody } from "./documentation/content/create-content-body";

@Controller("contents")
@ApiTags("contents")
export class ContentController {
  @Get()
  @ApiResponseGeneric({
    code: Code.SUCCESS,
    data: RestContentResponse,
    isArray: true,
  })
  // TODO : pagenation 구현 필요
  async getContentList(
    @Query() query: RestGetContentListQuery,
  ): Promise<RestResponse<RestContentResponse[] | null>> {
    throw new Error("Not implemented");
  }

  @Get(":contentId")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: RestContentResponse })
  async getContent(
    @Param("contentId") contentId: string,
  ): Promise<RestResponse<RestContentResponse | null>> {
    throw new Error("Not implemented");
  }

  @Delete(":contentId")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: null })
  async deleteContent(
    @Param("contentId") contentId: string,
  ): Promise<RestResponse<null>> {
    throw new Error("Not implemented");
  }

  @Patch(":contentId")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: RestContentResponse })
  async editContent(
    @Param("contentId") contentId: string,
    @Body() body: RestEditContentBody,
  ): Promise<RestResponse<RestContentResponse>> {
    throw new Error("Not implemented");
  }

  @Post()
  @ApiResponseGeneric({ code: Code.CREATED, data: RestContentResponse })
  async createContent(
    @Body() body: RestCreateContentBody,
  ): Promise<RestResponse<RestContentResponse>> {
    throw new Error("Not implemented");
  }

  @Get(":contentId/likes")
  // TODO: pagenation 구현 필요
  async getLikes(
    @Param("contentId") contentId: string,
    @Query() query: unknown,
  ) {}
}
