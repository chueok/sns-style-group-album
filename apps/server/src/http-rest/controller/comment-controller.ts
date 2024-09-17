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
import { ApiResponseGeneric } from "./documentation/common/decorator/api-response-generic";
import { RestCommentCreateBody } from "./documentation/comment/rest-comment-create-body";
import { RestResponseComment } from "./documentation/comment/rest-response-comment";
import { RestCommentEditBody } from "./documentation/comment/rest-comment-edit-body";
import { Code } from "@repo/be-core";

@Controller("comments")
@ApiTags("comments")
export class CommentController {
  @Post()
  @ApiResponseGeneric({ code: Code.SUCCESS, data: RestResponseComment })
  async createComment(@Body() body: RestCommentCreateBody) {}

  @Get(":id")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: RestResponseComment })
  async getComment(@Param("id") commentId: string) {}

  @Patch(":id")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: RestResponseComment })
  async editComment(
    @Param("id") commentId: string,
    @Body() body: RestCommentEditBody,
  ) {}

  @Delete(":id")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: null })
  async deleteComment(@Param("id") commentId: string) {}

  @Post(":id/like")
  @ApiResponseGeneric({ code: Code.SUCCESS, data: null })
  async likeComment(@Param("id") commentId: string) {}
}
