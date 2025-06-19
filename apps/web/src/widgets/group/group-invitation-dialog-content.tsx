import { useGroupDetail } from '@/trpc/hooks/group/use-group-list';
import { useInvitationCode } from '@/trpc/hooks/group/use-invitation-link';
import { getFrontendUrl } from '@/utils';
import { Button } from '@repo/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Check, Files } from 'lucide-react';
import { useState } from 'react';

export const GroupInvitationDialogContent = ({
  groupId,
}: {
  groupId: string;
}) => {
  const { group } = useGroupDetail(groupId);

  const { invitationCode } = useInvitationCode(groupId);

  const invitationLink = `${getFrontendUrl()}/invitation/${invitationCode}`;

  const [isCopied, setIsCopied] = useState(false);
  const handleCopyButtonClick = () => {
    navigator.clipboard.writeText(invitationLink);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{group?.name}</DialogTitle>
      </DialogHeader>
      <div className="tw-w-full tw-space-y-2">
        <Label htmlFor="group-invite-link">그룹 초대 링크</Label>
        <div className="tw-relative">
          <Input id="group-invite-link" value={invitationLink} disabled />
          <Button
            variant="ghost"
            size="icon"
            className="tw-w-8 tw-h-8 tw-rounded-full tw-absolute tw-right-1 tw-top-[calc(50%-16px)]"
            onClick={handleCopyButtonClick}
          >
            {isCopied ? (
              <Check className="tw-h-4 tw-w-4 tw-text-muted-foreground" />
            ) : (
              <Files className="tw-h-4 tw-w-4 tw-text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>
      <DialogFooter className="sm:tw-justify-start">
        <DialogClose asChild>
          <Button>닫기</Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
};
