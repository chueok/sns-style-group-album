import { useFloatingFunction } from '@/providers/floating-provider/context';
import { Button } from '@repo/ui/button';
import { useRef, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import useWidth from './use-width';
import { trpc } from '@/trpc/trpc';
import { useGroupStore } from '@/store/group-store';

// TODO: 실제 이미지로 변경 필요
const dummyImages = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  url: `https://picsum.photos/${512}/${512}?random=${i}`,
}));

const calcGapPx = (width: number) => {
  const remainder = width % 3;
  if (remainder === 0) {
    return 3;
  } else if (remainder === 1) {
    return 2;
  } else {
    return 1;
  }
};

const AddButton = () => {
  const selectedGroupId = useGroupStore((state) => state.selectedGroupId);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { mutateAsync: generateMediaUploadUrls } =
    trpc.content.generateMediaUploadUrls.useMutation();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!selectedGroupId) {
      console.error('selectedGroupId is not set');
      return;
    }

    const files = event.target.files;
    if (files && files.length > 0) {
      // TODO: 파일 업로드 처리 로직 추가
      console.log('Selected files:', files);
      const urlList = await generateMediaUploadUrls({
        groupId: selectedGroupId,
        mimeTypeList: Array.from(files).map((file) => file.type),
      });
      console.log('Generated URLs:', urlList);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="tw-hidden"
      />
      <Button
        variant="outline"
        size="icon"
        className="!tw-rounded-full"
        onClick={handleClick}
      >
        <Plus />
      </Button>
    </>
  );
};

const AlbumPage = () => {
  const { containerRef, width } = useWidth();

  const { setNode, setIsVisible, setPosition } = useFloatingFunction();

  useEffect(() => {
    setNode(<AddButton />);
    setPosition({ anchorPoint: 'bottom-right', x: 50, y: 50 });
    setIsVisible(true);
  }, []);

  // 이미지 크기와 간격 계산
  const gap = calcGapPx(width);

  return (
    <div ref={containerRef} className="tw-w-full">
      <div
        className="tw-grid"
        style={{
          gridTemplateColumns: `repeat(3, 1fr)`,
          gap: `${gap}px`,
          width: '100%',
        }}
      >
        {dummyImages.map((image) => (
          <div
            key={image.id}
            className="tw-aspect-square tw-overflow-hidden tw-rounded-none"
          >
            <img
              src={image.url}
              alt={`더미 이미지 ${image.id}`}
              className="tw-w-full tw-h-full tw-object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlbumPage;
