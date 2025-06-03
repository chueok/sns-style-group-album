import { Button } from '@repo/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/avatar';
import { Edit3 } from 'lucide-react';
import { useAuth } from '@/trpc/hooks/auth/use-auth';
import { useDialog } from '../dialog-provider';
import { UsernameEditDialog } from '@/widgets/username/username-edit-dialog';

export const ProfileHeader = () => {
  const { user } = useAuth();
  const dialog = useDialog();

  const openDialog = () => {
    dialog.open(({ isOpen, close }) => (
      <UsernameEditDialog isInitial={false} close={close} />
    ));
  };

  if (!user) {
    return null;
  }

  const username = user.username || 'Unknown';

  return (
    <div className="tw-flex tw-items-center tw-justify-start tw-gap-3">
      <Avatar className="tw-h-12 tw-w-12">
        <AvatarImage src="/placeholder.svg?height=48&width=48" alt="Profile" />
        <AvatarFallback className="tw-bg-gray-900 tw-text-white">
          {username.slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="tw-w-auto">
        <h3 className="tw-font-semibold tw-text-lg">{username}</h3>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={openDialog}
        className="tw-h-8 tw-w-8"
      >
        <Edit3 className="tw-h-4 tw-w-4" />
      </Button>
    </div>
  );
};
