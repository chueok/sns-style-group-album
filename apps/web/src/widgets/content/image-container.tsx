import { useRef, useState } from 'react';

/**
 * full: 이미지 전체 표시 여부 (true: 전체 표시, false: 컨테이너 비율에 맞게 표시)
 */
export const ImageContainer = (props: { imageUrl: string }) => {
  const { imageUrl } = props;
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const width = imageContainerRef.current?.clientWidth || 0;
  const height = imageContainerRef.current?.clientHeight || 1;
  const imageContainerRatio = width / height;

  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 1 });
  const imageRatio = naturalSize.width / naturalSize.height;

  const isLandscape = imageRatio > imageContainerRatio;

  return (
    <div
      ref={imageContainerRef}
      className="tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center"
    >
      <img
        src={imageUrl}
        data-landscape={isLandscape}
        className="data-[landscape=true]:tw-w-full data-[landscape=false]:tw-h-full tw-aspect-auto :tw-object-contain"
        onLoad={(e) => {
          const img = e.target as HTMLImageElement;
          setNaturalSize({
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        }}
      />
    </div>
  );
};

export const SquareImageContainer = (props: { imageUrl: string }) => {
  const { imageUrl } = props;
  return (
    <div className="tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center">
      <img src={imageUrl} className="tw-w-full tw-h-full tw-object-cover" />
    </div>
  );
};
