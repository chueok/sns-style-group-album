import { useGroupStore } from '@/store/group-store';
import { trpc } from '@/trpc/trpc';

export const useUploadMedia = () => {
  const selectedGroupId = useGroupStore((state) => state.selectedGroupId);

  const { mutateAsync: generateMediaUploadUrls } =
    trpc.content.generateMediaUploadUrls.useMutation();
  const trpcUtils = trpc.useUtils();

  const uploadMedia = async (files: FileList) => {
    if (!selectedGroupId) {
      console.error('Group is not selected');
      return;
    }

    if (files.length === 0) {
      console.error('files is empty');
      return;
    }

    const media = Array.from(files).map((file) => ({
      size: file.size,
      ext: file.name.split('.').pop() || '',
      mimeType: file.type,
    }));

    // presigned url 생성
    const urls = await generateMediaUploadUrls({
      groupId: selectedGroupId,
      media,
    });

    // 각 파일에 대해 업로드 실행
    try {
      const uploadPromises = urls.map(async (uploadUrl, index) => {
        const file = files.item(index);
        if (!file) {
          throw new Error('File not found');
        }

        const response = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to upload file ${file.name}`);
        } else {
          trpcUtils.content.getGroupMedia.invalidate();
        }
      });

      await Promise.all(uploadPromises);

      // TODO: 업로드 완료 후 이미지 목록 새로고침 로직 추가
    } catch (error) {
      console.error('Error uploading files:', error);
      // TODO: 에러 처리 UI 추가
    }
  };

  return { uploadMedia };
};
