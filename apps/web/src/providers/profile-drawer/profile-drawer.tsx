import { Button } from '@repo/ui/button';
import { Separator } from '@repo/ui/separator';
import {
  UserPlus,
  History,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { ProfileHeader } from './profile-header';
import { GroupList } from './group-list';
import { useAuth } from '@/trpc/hooks/auth/use-auth';
import { DrawerTitle, DrawerDescription } from '@repo/ui/drawer';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useEffect } from 'react';
import { UsernameEditDialog } from '@/widgets/username/username-edit-dialog';
import { useDialog } from '../dialog-provider';

// 초기 유저 이름 셋팅
const useInitialUsernameSetting = () => {
  const { user } = useAuth();

  const dialog = useDialog(); // TODO: useDialog 사용하지 않도록 변경 필요

  const openInitialUsernameDialog = () =>
    dialog.open(
      ({ isOpen, close }) => (
        <UsernameEditDialog isInitial={true} close={close} />
      ),
      true
    );

  useEffect(() => {
    if (user && !user.username) {
      openInitialUsernameDialog();
    }
  }, [user]);
};

export const ProfileDrawer = () => {
  const { logout } = useAuth();

  const handleSettings = () => {
    console.log('settings');
  };

  const handleActivityHistory = () => {
    console.log('activity history');
  };

  useInitialUsernameSetting();

  return (
    <div className="tw-flex tw-flex-col tw-h-full">
      <VisuallyHidden>
        <DrawerTitle>Profile</DrawerTitle>
        <DrawerDescription>Profile settings and management</DrawerDescription>
      </VisuallyHidden>
      {/* Profile Header */}
      <div className="tw-p-6 tw-border-b">
        <ProfileHeader />
      </div>

      {/* Navigation Content */}
      <div className="tw-flex-1 tw-overflow-y-auto">
        {/* My Groups Section */}
        <div className="tw-p-4">
          <GroupList />
        </div>

        <Separator />

        {/* Invite to Selected Group */}
        <Button
          variant="ghost"
          className="tw-w-full !tw-justify-start tw-gap-2"
          onClick={handleActivityHistory}
        >
          <UserPlus className="tw-h-4 tw-w-4 tw-text-muted-foreground" />
          <span className="tw-text-sm tw-font-medium tw-text-muted-foreground">
            선택된 그룹에 초대
          </span>
        </Button>

        <Separator />

        {/* Activity History */}
        <Button
          variant="ghost"
          className="tw-w-full !tw-justify-start tw-gap-2"
          onClick={handleActivityHistory}
        >
          <History className="tw-h-4 tw-w-4 tw-text-muted-foreground" />
          <span className="tw-text-sm tw-font-medium tw-text-muted-foreground">
            활동 내역
          </span>
          <ChevronRight className="tw-h-4 tw-w-4 tw-text-muted-foreground tw-ml-auto" />
        </Button>

        <Separator />

        {/* Settings */}

        <Button
          variant="ghost"
          className="tw-w-full !tw-justify-start tw-gap-2"
          onClick={handleSettings}
        >
          <Settings className="tw-h-4 tw-w-4 tw-text-muted-foreground" />
          <span className="tw-text-sm tw-font-medium tw-text-muted-foreground">
            설정
          </span>
        </Button>
      </div>

      {/* Footer Actions */}
      <div className="tw-border-t">
        <Button
          variant="ghost"
          className="tw-w-full !tw-justify-start tw-gap-2 tw-text-destructive hover:tw-text-destructive/80 hover:tw-bg-destructive/10"
          onClick={logout}
        >
          <LogOut className="tw-h-4 tw-w-4" />
          <span className="tw-text-sm tw-font-medium">로그아웃</span>
        </Button>
      </div>
    </div>
  );
};
