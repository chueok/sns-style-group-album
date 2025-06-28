import { trpc } from '@/trpc/trpc';

export const useAddComment = () => {
  const utils = trpc.useUtils();

  const { mutateAsync: addComment, isPending } =
    trpc.comment.createComment.useMutation({
      onSuccess: (data) => {
        utils.comment.getCommentsOfContent.invalidate();
      },
    });

  return { addComment, isPending };
};
