'use client';

import { useFloatingFunction } from '@/providers/floating-provider/context';
import { Button } from '@repo/ui/button';
import { useRef, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import useWidth from './use-width';
import { useUploadMedia } from '@/trpc/hooks/media/use-upload-media';
import { useMedia } from '@/trpc/hooks/media/use-media';

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

const useInfiniteScroll = (onIntersect: () => void) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(0);
        if (entry?.isIntersecting) {
          onIntersect();
        }
      },
      { threshold: 0.1 }
    );

    if (targetRef.current) {
      observerRef.current.observe(targetRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [onIntersect]);

  return targetRef;
};

const AlbumPage = () => {
  const { containerRef, width } = useWidth();
  const { setNode, setIsVisible, setPosition } = useFloatingFunction();

  useEffect(() => {
    setNode(<AddButton />);
    setPosition({ anchorPoint: 'bottom-right', x: 50, y: 50 });
    setIsVisible(true);
  }, []);

  const gap = calcGapPx(width);
  const { media, hasNextPage, fetchNextPage } = useMedia();

  const loadMoreRef = useInfiniteScroll(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  });

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
        {media.map((item) => (
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
        <div ref={loadMoreRef} className="tw-h-4 tw-w-full" />
      </div>
    </div>
  );
};

export default AlbumPage;
