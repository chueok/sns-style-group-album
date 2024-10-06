import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RestResponse } from "./dto/common/rest-response";
import {
  Code,
  DeleteContentAdapter,
  DeleteContentUsecase,
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
import { HttpObjectStorageGuard } from "../auth/guard/object-storage-guard";
import { CreateMediaListContentBody } from "./dto/content/create-media-list-content-body";
import { MediaService } from "../media/media-service";
import { SaveTemporaryMediaAdapter } from "../media/port/save-temporary-media-port";
import { VerifiedUser } from "../auth/decorator/verified-user";
import { VerifiedUserPayload } from "../auth/type/verified-user-payload";
import { ContentUploadUrlDTO } from "./dto/content/content-upload-url-dto";
import { MinioWebhookBody } from "./dto/content/minio-webhook-body";
import mime from "mime";
import { ConfirmMediaUploadedAdapter } from "../media/port/confirm-original-media-uploaded-port";
import { ConfirmResponsiveMediaUploadedAdapter } from "../media/port/confirm-responsive-media-uploaded-port";
import { Permission, PermissionEnum } from "../auth/decorator/permission";
import { HttpPermissionGuard } from "../auth/guard/permission-guard";

@Controller("contents")
@ApiTags("contents")
export class ContentController {
  constructor(
    @Inject(DiTokens.MediaObjectStorage)
    private readonly mediaObjectStorage: IObjectStoragePort,

    @Inject(DiTokens.GetMediaContentListUsecase)
    private readonly getMediaContentListUsecase: GetMediaContentListUsecase,

    private readonly mediaService: MediaService,

    @Inject(DiTokens.DeleteContentUsecase)
    private readonly deleteContentUsecase: DeleteContentUsecase,
  ) {}

  @Get("group/:groupId/medias")
  @UseGuards(HttpPermissionGuard)
  @Permission(PermissionEnum.GROUP_MEMBER)
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

  // TODO WEB에서 Test 필요함.
  @Post("media-upload-hook/original")
  @UseGuards(HttpObjectStorageGuard)
  async mediaUploadHook(@Body() body: MinioWebhookBody) {
    const promises = body.Records.map(async (record) => {
      const object = record.s3.object;
      const adapter = await ConfirmMediaUploadedAdapter.new({
        id: object.key,
        originalRelativePath: object.key,
        size: object.size,
        mimetype: object.contentType,
        ext: mime.extension(object.contentType) || "",
      });
      await this.mediaService.confirmOriginalMediaUploaded(adapter);
    });

    await Promise.allSettled(promises);

    return;
  }

  // TODO WEB에서 Test 필요함.
  @Post("media-upload-hook/responsive/thumbnail")
  @UseGuards(HttpObjectStorageGuard)
  async thumbnailMediaUploadHook(@Body() body: MinioWebhookBody) {
    const promises = body.Records.map(async (record) => {
      const object = record.s3.object;
      const adapter = await ConfirmResponsiveMediaUploadedAdapter.new({
        id: object.key,
        thumbnailRelativePath: object.key,
      });
      await this.mediaService.confirmResponsiveMediaUploaded(adapter);
    });

    await Promise.allSettled(promises);

    return;
  }

  @Post("media-upload-hook/responsive/large")
  @UseGuards(HttpObjectStorageGuard)
  async largeMediaUploadHook(@Body() body: MinioWebhookBody) {
    const promises = body.Records.map(async (record) => {
      const object = record.s3.object;
      const adapter = await ConfirmResponsiveMediaUploadedAdapter.new({
        id: object.key,
        largeRelativePath: object.key,
      });
      await this.mediaService.confirmResponsiveMediaUploaded(adapter);
    });

    await Promise.allSettled(promises);

    return;
  }

  @Post("group/:groupId/medias")
  @UseGuards(HttpPermissionGuard)
  @Permission(PermissionEnum.GROUP_MEMBER)
  @ApiResponseGeneric({
    code: Code.CREATED,
    data: ContentUploadUrlDTO,
  })
  async createMediaContentList(
    @VerifiedUser() user: VerifiedUserPayload,
    @Param("groupId") groupId: string,
    @Body() body: CreateMediaListContentBody,
  ): Promise<RestResponse<ContentUploadUrlDTO>> {
    // type이 정해지지 않음...
    // 1. db에 type없이 저장 이후 webhook 요청이 오면 업데이트
    //    - 실제 업로드 되지 않으면 의미없는 entity인데, db에 저장하는게 맞을까?
    // 2. type 없이 임시 데이터를 가지고 있다가, webhook 요청이 오면 실제 저장
    //    - BE 서버가 여러개일 경우 문제가 될 수 있음.

    const promises = Array.from({ length: body.numContent }).map(async () => {
      const adapter = await SaveTemporaryMediaAdapter.new({
        groupId,
        ownerId: user.id,
      });

      return await this.mediaService.saveTemporaryMedia(adapter);
    });

    const ret = new ContentUploadUrlDTO();

    await Promise.allSettled(promises).then((results) => {
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          ret.presignedUrlList.push(result.value);
        }
      });
    });

    return RestResponse.success(ret);
  }

  // @Get(":contentId")
  // @ApiResponseGeneric({ code: Code.SUCCESS, data: MediaContentResponseDTO })
  // async getContent(
  //   @Param("contentId") contentId: string,
  // ): Promise<RestResponse<MediaContentResponseDTO | null>> {
  //   throw new Error("Not implemented");
  // }

  @Delete("group/:groupId/content/:contentId")
  @UseGuards(HttpPermissionGuard)
  @Permission(PermissionEnum.CONTENT_OWNER)
  @ApiResponseGeneric({ code: Code.SUCCESS, data: null })
  async deleteContent(
    @Param("contentId") contentId: string,
  ): Promise<RestResponse<null>> {
    const adapter = await DeleteContentAdapter.new({
      contentId,
    });

    await this.deleteContentUsecase.execute(adapter);

    return RestResponse.success(null);
  }

  // @Patch(":contentId")
  // @ApiResponseGeneric({ code: Code.SUCCESS, data: MediaContentResponseDTO })
  // async editContent(
  //   @Param("contentId") contentId: string,
  //   @Body() body: RestEditContentBody,
  // ): Promise<RestResponse<MediaContentResponseDTO>> {
  //   throw new Error("Not implemented");
  // }

  // @Post()
  // @ApiResponseGeneric({ code: Code.CREATED, data: MediaContentResponseDTO })
  // async createContent(
  //   @Body() body: RestCreateContentBody,
  // ): Promise<RestResponse<MediaContentResponseDTO>> {
  //   throw new Error("Not implemented");
  // }

  // @Get(":contentId/likes")
  // // TODO: pagenation 구현 필요
  // async getLikes(
  //   @Param("contentId") contentId: string,
  //   @Query() query: unknown,
  // ) {}
}
