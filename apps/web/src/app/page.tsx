'use client';

import { useProfileDrawer } from '@/providers/profile-drawer/provider';
import { Button } from '@repo/ui/button';

export default function Home() {
  const {
    open,
    scrollHandlers,
    touchHandlers,
    setPinned: setIsPinned,
  } = useProfileDrawer();

  return (
    <div {...scrollHandlers} {...touchHandlers}>
      <div>Home</div>
      <Button onClick={open}>Open Drawer</Button>
    </div>
  );
}
