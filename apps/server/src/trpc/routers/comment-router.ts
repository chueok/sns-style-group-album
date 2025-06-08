import { SComment, SCommentPaginationParams } from '@repo/be-core';
import { authProcedure, router } from '../trpc';
import z from 'zod';

export const commentRouter = router({
  createComment: authProcedure
    .input(
      SComment.pick({
        contentId: true,
        text: true,
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
});
