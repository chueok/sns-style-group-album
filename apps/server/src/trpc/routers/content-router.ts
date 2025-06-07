import z from 'zod';
import { authProcedure, router } from '../trpc';
import { SMedia, SMediaPaginationParams } from '@repo/be-core';

export const contentRouter = router({
  generateMediaUploadUrls: authProcedure
    .input(
      z.object({
        groupId: z.string(),
        media: z.array(
          z.object({
            size: z.number(),
            ext: z.string(),
            mimeType: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const {
        user,
        content: { contentService },
      } = ctx;
      const { groupId, media } = input;

      const urlList = await contentService.generateMediaUploadUrls({
        requesterId: user.id,
        groupId,
        media,
      });

      return urlList;
    }),

  getGroupMedia: authProcedure
    .input(
      SMediaPaginationParams.extend({
        groupId: z.string(),
      })
    )
    .output(
      z.object({
        items: z.array(SMedia),
        nextCursor: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { groupId, ...pagination } = input;
      const {
        user,
        content: { contentService },
      } = ctx;

      const media = await contentService.getGroupMedia({
        groupId,
        requesterId: user.id,
        pagination,
      });
      return media;
    }),
});
