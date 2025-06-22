import { SComment, SCommentPaginationParams } from '@repo/be-core';
import { authProcedure, router } from '../trpc';
import z from 'zod';

export const commentRouter = router({
  createComment: authProcedure
    .input(
      z.object({
        contentId: z.string(),
        text: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const {
        user,
        comment: { commentService },
      } = ctx;
      const { contentId, text } = input;

      const comment = await commentService.createUserComment({
        requesterId: user.id,
        contentId,
        text,
      });

      return comment;
    }),

  getComment: authProcedure
    .input(
      z.object({
        commentId: z.string(),
      })
    )
    .output(SComment)
    .query(async ({ input, ctx }) => {
      const {
        user,
        comment: { commentService },
      } = ctx;
      const { commentId } = input;

      const comment = await commentService.getComment({
        requesterId: user.id,
        commentId,
      });

      return comment;
    }),

  getCommentsOfContent: authProcedure
    .input(
      SCommentPaginationParams.extend({
        contentId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const {
        user,
        comment: { commentService },
      } = ctx;
      const { contentId, ...pagination } = input;

      const comments = await commentService.getCommentsOfContent({
        requesterId: user.id,
        contentId,
        pagination,
      });

      return comments;
    }),

  getCommentsOfGroup: authProcedure
    .input(
      SCommentPaginationParams.extend({
        groupId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const {
        user,
        comment: { commentService },
      } = ctx;
      const { groupId, ...pagination } = input;

      const comments = await commentService.getCommentsOfGroup({
        requesterId: user.id,
        groupId,
        pagination,
      });

      return comments;
    }),
});
