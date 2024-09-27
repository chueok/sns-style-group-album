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
import { RestCommentCreateBody } from "./dto/comment/comment-create-body";
import { RestCommentResponse } from "./dto/comment/comment-response";
import { RestCommentEditBody } from "./dto/comment/comment-edit-body";
import { Code } from "@repo/be-core";
import { RestGetCommentListQuery } from "./dto/comment/get-comment-list-query";
import { RestResponse } from "./dto/common/rest-response";

@Controller("comments")
@ApiTags("comments")
export class CommentController {
  @Post()
  @ApiResponseGeneric({ code: Code.CREATED, data: RestCommentResponse })
  async createComment(
    @Body() body: RestCommentCreateBody,
  ): Promise<RestResponse<RestCommentResponse | null>> {
    throw new Error("Not implemented");
  }

  @Get()
  @ApiResponseGeneric({
    code: Code.SUCCESS,
    data: RestCommentResponse,
    isArray: true,
  })
  // TODO : pagenation 구현 필요 (content에 해당하는 comment를 가져오기 위함)
  async getCommentList(
    @Query() query: RestGetCommentListQuery,
  ): Promise<RestResponse<RestCommentResponse[] | null>> {
    throw new Error("Not implemented");
  }

  @Get(":commentId")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: RestCommentResponse })
  async getComment(
    @Param("commentId") commentId: string,
  ): Promise<RestResponse<RestCommentResponse | null>> {
    throw new Error("Not implemented");
  }

  @Patch(":commentId")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: RestCommentResponse })
  async editComment(
    @Param("commentId") commentId: string,
    @Body() body: RestCommentEditBody,
  ): Promise<RestResponse<RestCommentResponse | null>> {
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
