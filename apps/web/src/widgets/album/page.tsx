'use client';

import { useFloatingFunction } from '@/providers/floating-provider/context';
import { Button } from '@repo/ui/button';
import { useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import useWidth from './use-width';
import { useUploadMedia } from '@/trpc/hooks/media/use-upload-media';
import { useMedia } from '@/trpc/hooks/media/use-media';
import { SearchBar } from './search-bar';
import { ScrollArea } from '@repo/ui/scroll-area';
import { useContentStore } from '@/store/content-store';
import { useRouter } from 'next/navigation';

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

const useStickyHeader = () => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const headerTransformY = useRef(0);

  useEffect(() => {
    if (!headerContainerRef.current) {
      throw new Error('headerContainerRef is not set');
    }
    if (!scrollAreaRef.current) {
      throw new Error('scrollAreaRef is not set');
    }

    // 스타일 직접 설정
    headerContainerRef.current.style.position = 'sticky';
    headerContainerRef.current.style.top = '0';

    const headerTopY = headerContainerRef.current.getBoundingClientRect().top;
    const headerBottomY =
      headerContainerRef.current.getBoundingClientRect().bottom;

    const headerHeight = headerBottomY - headerTopY;

    const handleScroll = () => {
      if (!headerContainerRef.current) return;
      if (!scrollAreaRef.current) return;

      const currentScrollY = scrollAreaRef.current.scrollTop;
      const scrollDeltaY = currentScrollY - lastScrollY.current;
      const isScrollingDown = scrollDeltaY > 0;

      // 스크롤이 아래로 내려갈 때 opacity를 점점 줄임
      if (isScrollingDown && currentScrollY > headerTopY) {
        // 헤더의 위치 설정
        headerTransformY.current -= scrollDeltaY;
        headerTransformY.current = Math.max(
          -headerHeight,
          Math.min(headerTransformY.current, 0)
        );
        headerContainerRef.current.style.transform = `translateY(${headerTransformY.current}px)`;

        // 투명도 설정
        const opacity = Math.min(
          1,
          Math.max(0, 1 - Math.abs(headerTransformY.current) / headerHeight)
        );
        headerContainerRef.current.style.opacity = opacity.toString();
      }
      // 스크롤이 위로 올라갈 때 opacity를 점점 늘림
      else if (!isScrollingDown) {
        // 헤더의 위치 설정
        headerTransformY.current -= scrollDeltaY;
        headerTransformY.current = Math.max(
          -headerHeight,
          Math.min(headerTransformY.current, 0)
        );
        headerContainerRef.current.style.transform = `translateY(${headerTransformY.current}px)`;

        // 투명도 설정
        const opacity = Math.min(
          1,
          Math.max(0, 1 - Math.abs(headerTransformY.current) / headerHeight)
        );
        headerContainerRef.current.style.opacity = opacity.toString();
      }

      lastScrollY.current = currentScrollY;
    };

    scrollAreaRef.current.addEventListener('scroll', handleScroll);
    return () => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return { headerContainerRef, scrollAreaRef };
};

const AlbumPage = () => {
  const { containerRef, width } = useWidth();
  const { setNode, setIsVisible, setPosition } = useFloatingFunction();
  const { headerContainerRef, scrollAreaRef } = useStickyHeader();
  const { setSelectedContentId } = useContentStore();
  const router = useRouter();

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

  // ScrollArea 적용해야 dropdown-menu 오픈 시 스크롤바 영역이 자연스럽게 사라짐
  return (
    <div ref={containerRef} className="tw-w-full tw-h-full">
      <ScrollArea className="tw-w-full tw-h-full" viewportRef={scrollAreaRef}>
        <div className="tw-w-full">
          <div
            ref={headerContainerRef}
            className="tw-z-10 tw-bg-background tw-border-border tw-transition-opacity tw-duration-200 tw-ease-out"
          >
            <SearchBar />
          </div>
          <div
            ref={scrollAreaRef}
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
                className="tw-aspect-square tw-overflow-hidden tw-rounded-none tw-cursor-pointer"
                onClick={() => {
                  setSelectedContentId(item.id);
                  router.push(`/content?id=${item.id}`);
                }}
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
      </ScrollArea>
    </div>
  );
};

export default AlbumPage;
