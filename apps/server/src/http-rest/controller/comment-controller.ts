import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ApiResponseOkGeneric } from "./documentation/common/decorator/api-response-generic";
import { RestCommentCreateBody } from "./documentation/comment/rest-comment-create-body";
import { RestResponseComment } from "./documentation/comment/rest-response-comment";
import { RestCommentEditBody } from "./documentation/comment/rest-comment-edit-body";

@Controller("comments")
@ApiTags("comments")
export class CommentController {
  @Post()
  @ApiResponseOkGeneric({ data: RestResponseComment })
  async createComment(@Body() body: RestCommentCreateBody) {}

  @Get(":id")
  @ApiResponseOkGeneric({ data: RestResponseComment })
  async getComment(@Param("id") commentId: string) {}

  @Patch(":id")
  @ApiResponseOkGeneric({ data: RestResponseComment })
  async editComment(
    @Param("id") commentId: string,
    @Body() body: RestCommentEditBody,
  ) {}

  @Delete(":id")
  @ApiResponseOkGeneric({ data: null })
  async deleteComment(@Param("id") commentId: string) {}

  @Post(":id/like")
  @ApiResponseOkGeneric({ data: null })
  async likeComment(@Param("id") commentId: string) {}
}
