'use client';

import { createContext, useContext, useMemo, useRef, useState } from 'react';
import { Drawer, DrawerContent } from '@repo/ui/drawer';
import { ProfileDrawer } from './profile-drawer';

interface DrawerContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;

  setPinned: (isPinned: boolean) => void;

  scrollHandlers: {
    onWheel: (e: React.WheelEvent) => void;
  };
  touchHandlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export const useProfileDrawer = () => {
  const context = useContext(DrawerContext);

  if (!context) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }

  return context;
};

const VERTICAL_THRESHOLD = 30;
const HORIZONTAL_THRESHOLD = 60;

export const ProfileDrawerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /**
   * basic open / close function
   */
  const [isOpen, setIsOpen] = useState(false);
  const open = () => {
    !pinned && setIsOpen(true);
  };

  const close = () => {
    !pinned && setIsOpen(false);
  };

  /**
   * pinned state
   */
  const [pinned, setPinnedFn] = useState(false);
  const setPinned = (isPinned: boolean) => {
    setPinnedFn(isPinned);
    isPinned && setIsOpen(true);
    // pinned 상태일 경우, isOpen도 true로 설정하여
    // pinned 상태가 false로 바뀔 때 열린 상태 유지
  };

  /**
   * scroll handler
   */
  const onWheel = (e: React.WheelEvent) => {
    if (e.deltaX < -1) {
      open();
    }
  };

  const onWheelForDrawer = (e: React.WheelEvent) => {
    if (e.deltaX > 1) {
      close();
    }
  };

  /**
   * touch handler
   */
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // 수직 드래그 량이 많을 경우, 해당 드래그로는 drawer를 열지 않음
    if (Math.abs(deltaY) > VERTICAL_THRESHOLD) {
      touchStartRef.current = null;
      return;
    }

    if (deltaX > HORIZONTAL_THRESHOLD) {
      open();
      touchStartRef.current = null;
    }
  };

  const onTouchEnd = () => {
    touchStartRef.current = null;
  };

  /**
   * context setting
   */
  const contextValue = useMemo(
    () => ({
      isOpen,
      open,
      close,
      setPinned,
      scrollHandlers: {
        onWheel: onWheel,
      },
      touchHandlers: {
        onTouchStart,
        onTouchMove,
        onTouchEnd,
      },
    }),
    [isOpen]
  );

  return (
    <DrawerContext.Provider value={contextValue}>
      {children}
      <Drawer
        autoFocus
        direction="left"
        open={pinned || isOpen}
        onOpenChange={(open) => {
          if (!pinned) {
            setIsOpen(open);
          }
        }}
        dismissible={!pinned}
      >
        <DrawerContent onWheel={onWheelForDrawer}>
          <ProfileDrawer />
        </DrawerContent>
      </Drawer>
    </DrawerContext.Provider>
  );
};
