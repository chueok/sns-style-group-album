'use client';

import { Button } from '@repo/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@repo/ui/tabs';
import { ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { useFloatingFunction } from '@/providers/floating-provider/context';
import AlbumPage from '@/widgets/album/page';
import { useGroupStore } from '@/store/group-store';
import { useProfileDrawer } from '@/providers/profile-drawer/provider';

export default function GroupPage() {
  const selectedGroupId = useGroupStore((state) => state.selectedGroupId);
  const setSelectedGroupId = useGroupStore((state) => state.setSelectedGroupId);

  const { setPinned, touchHandlers, scrollHandlers } = useProfileDrawer();

  useEffect(() => {
    setSelectedGroupId(selectedGroupId);
    selectedGroupId ? setPinned(false) : setPinned(true);
  }, [selectedGroupId, setSelectedGroupId, setPinned]);

  const { setNode, setIsVisible, setPosition } = useFloatingFunction();

  useEffect(() => {
    setNode(
      <Button variant="outline" size="icon">
        <ChevronRight />
      </Button>
    );
    setPosition({ anchorPoint: 'bottom-right', x: 50, y: 50 });
    setIsVisible(true);
  }, []);

  return (
    <main
      onWheel={scrollHandlers.onWheel}
      onTouchStart={touchHandlers.onTouchStart}
      onTouchMove={touchHandlers.onTouchMove}
      onTouchEnd={touchHandlers.onTouchEnd}
      className="tw-h-screen"
    >
      <Tabs defaultValue="home" className="tw-w-full tw-h-full">
        <TabsContent value="home" className="tw-h-[calc(100%-36px)]">
          <div>홈</div>
        </TabsContent>
        <TabsContent value="album" className="tw-h-[calc(100%-36px)]">
          <AlbumPage></AlbumPage>
        </TabsContent>
        <TabsContent value="story" className="tw-h-[calc(100%-36px)]">
          <div>스토리</div>
        </TabsContent>
        <TabsContent value="bucket" className="tw-h-[calc(100%-36px)]">
          <div>버킷</div>
        </TabsContent>
        <TabsContent value="calendar" className="tw-h-[calc(100%-36px)]">
          <div>캘린더</div>
        </TabsContent>
        <TabsList className="tw-h-9 tw-grid tw-w-full tw-grid-cols-5 tw-rounded-none">
          <TabsTrigger value="home">홈</TabsTrigger>
          <TabsTrigger value="album">앨범</TabsTrigger>
          <TabsTrigger value="story">스토리</TabsTrigger>
          <TabsTrigger value="bucket">버킷</TabsTrigger>
          <TabsTrigger value="calendar">캘린더</TabsTrigger>
        </TabsList>
      </Tabs>
    </main>
  );
}
