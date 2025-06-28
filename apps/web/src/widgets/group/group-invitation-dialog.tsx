import { Button } from '@repo/ui/button';
import { Dialog, DialogTrigger, DialogContent } from '@repo/ui/dialog';
import { UserRoundPlus } from 'lucide-react';
import { useState } from 'react';
import { GroupInvitationDialogContent } from './group-invitation-dialog-content';

export const GroupInvitationDialog = ({ groupId }: { groupId: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="tw-w-full !tw-justify-start tw-gap-4 !tw-p-0 tw-h-8"
        >
          <UserRoundPlus className="tw-h-8 tw-w-8 tw-p-1 tw-text-muted-foreground" />
          <span className="tw-text-sm tw-font-medium tw-text-muted-foreground">
            친구 초대하기
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="!tw-max-w-[300px] sm:!tw-max-w-sm">
        <GroupInvitationDialogContent groupId={groupId} />
      </DialogContent>
    </Dialog>
  );
};
