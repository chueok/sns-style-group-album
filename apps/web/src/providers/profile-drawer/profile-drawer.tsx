import { Button } from '@repo/ui/button';
import { Separator } from '@repo/ui/separator';
import { History, Settings, LogOut, ChevronRight } from 'lucide-react';
import { ProfileHeader } from './profile-header';
import { GroupList } from './group-list';
import { useAuth } from '@/trpc/hooks/auth/use-auth';
import { DrawerTitle, DrawerDescription } from '@repo/ui/drawer';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { InitialUsernameEditDialog } from '@/widgets/username/initial-username-edit-dialog';
import { EditGroupDrawer } from '../../widgets/group/group-edit-drawer';

export const ProfileDrawer = () => {
  const { user, logout } = useAuth();

  const handleSettings = () => {
    console.log('settings');
  };

  const handleActivityHistory = () => {
    console.log('activity history');
  };

  return (
    <div className="tw-flex tw-flex-col tw-h-full">
      {user?.username === '' && <InitialUsernameEditDialog />}
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

        {/* Selected Group Detail */}
        <EditGroupDrawer />
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
