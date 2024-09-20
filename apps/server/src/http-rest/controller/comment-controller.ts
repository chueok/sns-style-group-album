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
import { ApiResponseGeneric } from "./documentation/decorator/api-response-generic";
import { RestCommentCreateBody } from "./documentation/comment/rest-comment-create-body";
import { RestResponseComment } from "./documentation/comment/rest-response-comment";
import { RestCommentEditBody } from "./documentation/comment/rest-comment-edit-body";
import { Code } from "@repo/be-core";
import { RestGetCommentListQuery } from "./documentation/comment/get-comment-list-query";
import { RestResponse } from "./documentation/common/rest-response";

@Controller("comments")
@ApiTags("comments")
export class CommentController {
  @Post()
  @ApiResponseGeneric({ code: Code.CREATED, data: RestResponseComment })
  async createComment(
    @Body() body: RestCommentCreateBody,
  ): Promise<RestResponse<RestResponseComment | null>> {
    throw new Error("Not implemented");
  }

  @Get()
  @ApiResponseGeneric({
    code: Code.SUCCESS,
    data: RestResponseComment,
    isArray: true,
  })
  // TODO : pagenation 구현 필요 (content에 해당하는 comment를 가져오기 위함)
  async getCommentList(
    @Query() query: RestGetCommentListQuery,
  ): Promise<RestResponse<RestResponseComment[] | null>> {
    throw new Error("Not implemented");
  }

  @Get(":commentId")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: RestResponseComment })
  async getComment(
    @Param("commentId") commentId: string,
  ): Promise<RestResponse<RestResponseComment | null>> {
    throw new Error("Not implemented");
  }

  @Patch(":commentId")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: RestResponseComment })
  async editComment(
    @Param("commentId") commentId: string,
    @Body() body: RestCommentEditBody,
  ): Promise<RestResponse<RestResponseComment | null>> {
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
