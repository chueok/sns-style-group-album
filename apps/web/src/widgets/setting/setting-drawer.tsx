import { Button } from '@repo/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@repo/ui/drawer';
import { Separator } from '@repo/ui/separator';
import {
  Bell,
  ChevronLeft,
  LogOut,
  Megaphone,
  Settings,
  ShieldQuestionIcon,
} from 'lucide-react';
import { useState } from 'react';

// TODO: 설정 상세 내용 구현 필요
export const SettingDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Drawer direction="bottom" open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          className="tw-w-full !tw-justify-start tw-gap-2"
        >
          <Settings className="tw-h-4 tw-w-4 tw-text-muted-foreground" />
          <span className="tw-text-sm tw-font-medium tw-text-muted-foreground">
            설정
          </span>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="tw-m-0 !tw-rounded-none !tw-w-screen !tw-h-screen !tw-max-h-screen">
        <DrawerHeader>
          <div className="tw-flex tw-items-center tw-justify-between">
            <DrawerClose onClick={() => setIsOpen(false)}>
              <ChevronLeft className="tw-h-6 tw-w-6 tw-text-muted-foreground" />
            </DrawerClose>
            <DrawerTitle>설정</DrawerTitle>
            <ChevronLeft className="tw-h-6 tw-w-6 tw-invisible" />
          </div>
        </DrawerHeader>
        <Separator />

        <Button
          variant="ghost"
          className="tw-w-full !tw-justify-start tw-gap-2"
        >
          <Bell className="tw-h-4 tw-w-4" />
          <span className="tw-text-sm tw-font-medium">알림 설정</span>
        </Button>
        <Button
          variant="ghost"
          className="tw-w-full !tw-justify-start tw-gap-2"
        >
          <Megaphone className="tw-h-4 tw-w-4" />
          <span className="tw-text-sm tw-font-medium">공지사항</span>
        </Button>
        <Button
          variant="ghost"
          className="tw-w-full !tw-justify-start tw-gap-2"
        >
          <ShieldQuestionIcon className="tw-h-4 tw-w-4" />
          <span className="tw-text-sm tw-font-medium">공지사항</span>
        </Button>
        <Button
          variant="ghost"
          className="tw-w-full !tw-justify-start tw-gap-2 tw-text-destructive"
        >
          <LogOut className="tw-h-4 tw-w-4" />
          <span className="tw-text-sm tw-font-medium">로그아웃</span>
        </Button>
      </DrawerContent>
    </Drawer>
  );
};
