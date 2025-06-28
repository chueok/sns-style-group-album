import { useRef } from 'react';

/**
 * swipe gesture 핸들러 커스텀 훅
 */

type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export const useSwipeGesture = (props: {
  horizontalThreshold: number;
  verticalThreshold: number;
  cancelHorizontalThreshold: number;
  cancelVerticalThreshold: number;
  onHorizontalSwipe?: (direction: 'left' | 'right', distance: number) => void;
  onVerticalSwipe?: (direction: 'up' | 'down', distance: number) => void;
  onSwipeEnd?: (params: {
    direction: SwipeDirection | null;
    distance: number;
    isCancelled: boolean;
  }) => void;
}) => {
  const {
    horizontalThreshold,
    verticalThreshold,
    cancelHorizontalThreshold,
    cancelVerticalThreshold,
    onHorizontalSwipe,
    onVerticalSwipe,
    onSwipeEnd,
  } = props;

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeDirectionRef = useRef<'horizontal' | 'vertical' | null>(null);
  const swipeDistanceRef = useRef<number>(0);
  const isCancelledRef = useRef<boolean>(false);

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
    swipeDirectionRef.current = null;
    swipeDistanceRef.current = 0;
    isCancelledRef.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // 수평 스와이프 중일 때 수직 움직임이 임계값을 넘으면 초기화
    if (
      swipeDirectionRef.current === 'horizontal' &&
      Math.abs(deltaY) > cancelVerticalThreshold
    ) {
      isCancelledRef.current = true;
      touchStartRef.current = null;
      swipeDirectionRef.current = null;
      return;
    }

    // 수직 스와이프 중일 때 수평 움직임이 임계값을 넘으면 초기화
    if (
      swipeDirectionRef.current === 'vertical' &&
      Math.abs(deltaX) > cancelHorizontalThreshold
    ) {
      isCancelledRef.current = true;
      touchStartRef.current = null;
      swipeDirectionRef.current = null;
      return;
    }

    // 수평 스와이프 감지
    if (Math.abs(deltaX) > horizontalThreshold) {
      swipeDirectionRef.current = 'horizontal';
      const direction: 'left' | 'right' = deltaX > 0 ? 'right' : 'left';
      swipeDistanceRef.current = deltaX;
      onHorizontalSwipe?.(direction, deltaX);
      return;
    }

    // 수직 스와이프 감지
    if (Math.abs(deltaY) > verticalThreshold) {
      swipeDirectionRef.current = 'vertical';
      const direction: 'up' | 'down' = deltaY > 0 ? 'down' : 'up';
      swipeDistanceRef.current = deltaY;
      onVerticalSwipe?.(direction, deltaY);
      return;
    }
  };

  const onTouchEnd = () => {
    if (swipeDirectionRef.current) {
      onSwipeEnd?.({
        direction:
          swipeDirectionRef.current === 'horizontal'
            ? swipeDistanceRef.current > 0
              ? 'right'
              : 'left'
            : swipeDistanceRef.current > 0
              ? 'down'
              : 'up',
        distance: swipeDistanceRef.current,
        isCancelled: isCancelledRef.current,
      });
    }
    touchStartRef.current = null;
    swipeDirectionRef.current = null;
    swipeDistanceRef.current = 0;
    isCancelledRef.current = false;
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};
