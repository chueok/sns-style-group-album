import { Button } from '@repo/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/avatar';
import { Edit3, User } from 'lucide-react';
import { useAuth } from '@/trpc/hooks/auth/use-auth';
import { useDialog } from '../dialog-provider';
import {
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import * as z from 'zod';
import { Label } from '@repo/ui/label';
import { useEffect, useState } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { EditableProfileAvatar } from './editable-profile-avatar';

const usernameFormSchema = z.object({
  username: z.string().min(1, '최소 1자 이상 입력해주세요.'),
});

const ProfileEditDialog = ({ close }: { close: () => void }) => {
  const { editUsername, user } = useAuth();

  /**
   * 기본 프로필 이름
   */
  const [defaultUsername, setDefaultUsername] = useState(user?.username || '');

  const [personalProfile, setPersonalProfile] = useState({
    name: user?.username || '',
    profileImageUrl: user?.profileImageUrl || '',
  });

  useEffect(() => {
    setPersonalProfile({
      name: user?.username || '',
      profileImageUrl: user?.profileImageUrl || '',
    });
  }, [user]);

  const handleSave = () => {
    // Handle save logic here
    const { username } = usernameFormSchema.parse({
      username: defaultUsername,
    });
    editUsername(username);

    close();
  };

  return (
    <DialogContent className="!tw-max-w-[300px] sm:!tw-max-w-sm tw-max-h-[90vh] tw-overflow-y-auto">
      <DialogHeader className="tw-w-full">
        <DialogTitle className="tw-flex tw-items-center tw-gap-2">
          <User className="tw-w-5 tw-h-5" />
          Edit Profile
        </DialogTitle>
        <VisuallyHidden>
          <DialogDescription>
            Manage your personal profile and group-specific profiles
          </DialogDescription>
        </VisuallyHidden>
      </DialogHeader>

      <div className="tw-flex tw-flex-col tw-items-center tw-space-y-4 tw-w-full">
        <div className="tw-flex tw-flex-col tw-items-center tw-space-y-4 tw-w-full">
          <div className="tw-w-full tw-space-y-6">
            <EditableProfileAvatar
              currentImage={personalProfile.profileImageUrl}
              onImageChange={(imageUrl) =>
                setPersonalProfile((prev) => ({
                  ...prev,
                  profileImageUrl: imageUrl,
                }))
              }
              fallbackText={defaultUsername.at(0) || ''}
              size="lg"
            />
          </div>
        </div>

        <div className="tw-w-full tw-space-y-4">
          <div className="tw-w-full tw-space-y-2">
            <Label htmlFor="personal-name">유저 이름</Label>
            <Input
              id="personal-name"
              value={defaultUsername}
              onChange={(e) => setDefaultUsername(e.target.value)}
            />
          </div>
        </div>
      </div>

      <DialogFooter className="tw-gap-2">
        <Button variant="outline">취소</Button>
        <Button onClick={handleSave}>저장</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export const ProfileHeader = () => {
  const { user } = useAuth();
  const dialog = useDialog();

  const openDialog = () => {
    dialog.open(({ isOpen, close }) => <ProfileEditDialog close={close} />);
  };

  if (!user) {
    return null;
  }

  const username = user.username || 'Unknown';

  return (
    <div className="tw-flex tw-items-center tw-justify-start tw-gap-3">
      <Avatar className="tw-h-12 tw-w-12">
        <AvatarImage src={user.profileImageUrl || ''} alt="Profile" />
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
