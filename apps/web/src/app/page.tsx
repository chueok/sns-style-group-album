'use client';

import { useProfileDrawer } from '@/providers/profile-drawer/provider';
import { Button } from '@repo/ui/button';
import { useEffect, useRef } from 'react';

export default function Home() {
  const {
    open,
    scrollHandlers,
    touchHandlers,
    setPinned: setIsPinned,
  } = useProfileDrawer();

  return (
    <div
      onWheel={scrollHandlers.onWheel}
      onTouchStart={touchHandlers.onTouchStart}
      onTouchMove={touchHandlers.onTouchMove}
      onTouchEnd={touchHandlers.onTouchEnd}
    >
      <div>Home</div>
      <Button onClick={open}>Open Drawer</Button>
    </div>
  );
}
