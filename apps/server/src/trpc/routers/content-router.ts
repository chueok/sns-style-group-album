import z from 'zod';
import { authProcedure, router } from '../trpc';

export const contentRouter = router({
  generateMediaUploadUrls: authProcedure
    .input(
      z.object({
        groupId: z.string(),
        mimeTypeList: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const {
        user,
        content: { contentService },
      } = ctx;
      const { groupId, mimeTypeList } = input;

      const urlList = await contentService.generateMediaUploadUrls({
        requesterId: user.id,
        groupId,
        mimeTypeList,
      });

      return urlList;
    }),
});
