'use client';

import { Button } from '@repo/ui/button';
import styles from './page.module.css';
import { useDialog } from '@/providers/dialog-provider';
import { InitialUsernameDialog } from '@/widgets/username/initial-username-dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@repo/ui/tabs';
import { ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { useFloatingFunction } from '@/providers/floating-provider/context';
import AlbumPage from '@/widgets/album/page';

export default function Home() {
  const dialog = useDialog();

  const openDialog = () =>
    dialog.open(({ isOpen, close }) => <InitialUsernameDialog close={close} />);

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
    <main>
      <Button onClick={openDialog}>Initial Username</Button>
      <Tabs defaultValue="home" className="tw-w-full">
        <TabsList className="tw-grid tw-w-full tw-grid-cols-5 tw-rounded-none">
          <TabsTrigger value="home">홈</TabsTrigger>
          <TabsTrigger value="album">앨범</TabsTrigger>
          <TabsTrigger value="story">스토리</TabsTrigger>
          <TabsTrigger value="bucket">버킷</TabsTrigger>
          <TabsTrigger value="calendar">캘린더</TabsTrigger>
        </TabsList>
        <TabsContent value="home">
          <div>홈</div>
        </TabsContent>
        <TabsContent value="album">
          <AlbumPage></AlbumPage>
        </TabsContent>
        <TabsContent value="story">
          <div>스토리</div>
        </TabsContent>
        <TabsContent value="bucket">
          <div>버킷</div>
        </TabsContent>
        <TabsContent value="calendar">
          <div>캘린더</div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
