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
import { ApiResponseGeneric } from "./dto/decorator/api-response-generic";
import { CommentCreateBody } from "./dto/comment/comment-create-body";
import { CommentResponseDTO } from "./dto/comment/comment-response-dto";
import { CommentEditBody } from "./dto/comment/comment-edit-body";
import { Code } from "@repo/be-core";
import { GetCommentListQuery } from "./dto/comment/get-comment-list-query";
import { RestResponse } from "./dto/common/rest-response";

@Controller("comments")
@ApiTags("comments")
export class CommentController {
  @Post("group/:groupId")
  @ApiResponseGeneric({ code: Code.CREATED, data: CommentResponseDTO })
  async createComment(
    @Body() body: CommentCreateBody,
  ): Promise<RestResponse<CommentResponseDTO>> {
    throw new Error("Not implemented");
  }

  @Get()
  @ApiResponseGeneric({
    code: Code.SUCCESS,
    data: CommentResponseDTO,
    isArray: true,
  })
  // TODO : pagenation 구현 필요 (content에 해당하는 comment를 가져오기 위함)
  async getCommentList(
    @Query() query: GetCommentListQuery,
  ): Promise<RestResponse<CommentResponseDTO[] | null>> {
    throw new Error("Not implemented");
  }

  @Get(":commentId")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: CommentResponseDTO })
  async getComment(
    @Param("commentId") commentId: string,
  ): Promise<RestResponse<CommentResponseDTO | null>> {
    throw new Error("Not implemented");
  }

  @Patch(":commentId")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: CommentResponseDTO })
  async editComment(
    @Param("commentId") commentId: string,
    @Body() body: CommentEditBody,
  ): Promise<RestResponse<CommentResponseDTO | null>> {
    throw new Error("Not implemented");
  }

  @Delete(":commentId")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: null })
  async deleteComment(
    @Param("commentId") commentId: string,
  ): Promise<RestResponse<null>> {
    throw new Error("Not implemented");
  }

  @Post(":commentId/like")
  @ApiResponseGeneric({ code: Code.CREATED, data: null })
  // TODO : like pagenation 구현 필요
  async likeComment(@Param("commentId") commentId: string) {}
}
