import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RestResponse } from "./dto/common/rest-response";
import {
  Code,
  GetContentListAdapter,
  GetMediaContentListUsecase,
  IObjectStoragePort,
} from "@repo/be-core";
import { ApiResponseGeneric } from "./dto/decorator/api-response-generic";
import { GetContentListQuery } from "./dto/content/get-content-list-query";
import { RestEditContentBody } from "./dto/content/edit-content-body";
import { RestCreateContentBody } from "./dto/content/create-content-body";
import { DiTokens } from "../../di/di-tokens";
import { MediaContentResponseDTO } from "./dto/content/media-content-response-dto";

@Controller("contents")
@ApiTags("contents")
export class ContentController {
  constructor(
    @Inject(DiTokens.MediaObjectStorage)
    private readonly mediaObjectStorage: IObjectStoragePort,

    @Inject(DiTokens.GetMediaContentListUsecase)
    private readonly getMediaContentListUsecase: GetMediaContentListUsecase,
  ) {}

  @Get("group/:groupId/medias")
  @ApiResponseGeneric({
    code: Code.SUCCESS,
    data: MediaContentResponseDTO,
    isArray: true,
  })
  async getMediaContentList(
    @Param("groupId") groupId: string,
    @Query() query: GetContentListQuery,
  ): Promise<RestResponse<MediaContentResponseDTO[]>> {
    const adapter = await GetContentListAdapter.new({
      groupId,
      limit: query.limit || 10,
      cursor: query.cursor,
      sortBy: query.sortBy || "createdDateTime",
      sortOrder: query.sortOrder || "desc",
    });

    const contentList = await this.getMediaContentListUsecase.execute(adapter);

    const dtos = await MediaContentResponseDTO.newListFromContents(
      contentList,
      this.mediaObjectStorage,
    );

    return RestResponse.success(dtos);
  }

  @Get(":contentId")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: MediaContentResponseDTO })
  async getContent(
    @Param("contentId") contentId: string,
  ): Promise<RestResponse<MediaContentResponseDTO | null>> {
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
  @ApiResponseGeneric({ code: Code.SUCCESS, data: MediaContentResponseDTO })
  async editContent(
    @Param("contentId") contentId: string,
    @Body() body: RestEditContentBody,
  ): Promise<RestResponse<MediaContentResponseDTO>> {
    throw new Error("Not implemented");
  }

  @Post()
  @ApiResponseGeneric({ code: Code.CREATED, data: MediaContentResponseDTO })
  async createContent(
    @Body() body: RestCreateContentBody,
  ): Promise<RestResponse<MediaContentResponseDTO>> {
    throw new Error("Not implemented");
  }

  @Get(":contentId/likes")
  // TODO: pagenation 구현 필요
  async getLikes(
    @Param("contentId") contentId: string,
    @Query() query: unknown,
  ) {}
}
