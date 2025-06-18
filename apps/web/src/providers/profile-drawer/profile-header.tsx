import { Button } from '@repo/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/avatar';
import { Edit3, Loader2, User } from 'lucide-react';
import { useAuth } from '@/trpc/hooks/auth/use-auth';
import {
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription,
  Dialog,
  DialogClose,
  DialogTrigger,
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

const ProfileEditDialog = () => {
  const { user, editUsername, editProfileImage, deleteProfileImage } =
    useAuth();

  /**
   * 기본 프로필 이름
   */
  const [defaultUsername, setDefaultUsername] = useState(user?.username || '');

  const [isSaving, setIsSaving] = useState(false);

  /**
   * 1. undefined : 이미지 변경되지 않음
   * 2. File : 이미지 변경 됨
   * 3. null : 이미지 삭제 됨
   */
  const [profileImage, setProfileImage] = useState<File | null | undefined>(
    undefined
  );

  const handleSave = () => {
    (async () => {
      setIsSaving(true);
      const { username } = usernameFormSchema.parse({
        username: defaultUsername,
      });

      // 1. username 변경
      const promises = [];
      if (username !== user?.username) {
        promises.push(editUsername(username));
      }

      // 2. profileImage 변경
      if (profileImage === null) {
        promises.push(deleteProfileImage());
      } else if (profileImage) {
        promises.push(editProfileImage(profileImage));
      }

      await Promise.all(promises);

      setIsSaving(false);
      setIsOpen(false);
    })();
  };

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDefaultUsername(user?.username || '');
    } else {
      setDefaultUsername('');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="tw-h-8 tw-w-8">
          <Edit3 className="tw-h-4 tw-w-4" />
        </Button>
      </DialogTrigger>
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
                currentImage={user?.profileImageUrl || ''}
                onImageChange={(file) => {
                  setProfileImage(file);
                }}
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
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="tw-w-4 tw-h-4 tw-animate-spin" />
            ) : (
              '저장'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const ProfileHeader = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const username = user.username || 'Unknown';

  return (
    <>
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
        <ProfileEditDialog />
      </div>
    </>
  );
};
