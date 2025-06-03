'use client';

import { useFloatingFunction } from '@/providers/floating-provider/context';
import { Button } from '@repo/ui/button';
import { useRef, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import useWidth from './use-width';
import { useUploadMedia } from '@/trpc/hooks/media/use-upload-media';
import { useMedia } from '@/trpc/hooks/media/use-media';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { uploadMedia } = useUploadMedia();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) {
      console.error('files is not set');
      return;
    }
    await uploadMedia(files);
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

  const { media } = useMedia();

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
        {media?.items.map((item) => (
          <div
            key={item.id}
            className="tw-aspect-square tw-overflow-hidden tw-rounded-none"
          >
            <img
              src={item.originalUrl}
              alt={`이미지 ${item.id}`}
              className="tw-w-full tw-h-full tw-object-cover"
            />
          </div>
        ))}
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
