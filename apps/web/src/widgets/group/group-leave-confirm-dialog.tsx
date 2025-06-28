import { useGroupDetail } from '@/trpc/hooks/group/use-group-list';
import { useLeaveGroup } from '@/trpc/hooks/group/use-leave-group';
import { Button } from '@repo/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/dialog';
import { Loader2, LogOut } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export const GroupLeaveConfirmDialog = ({
  isOwner,
  groupId,
}: {
  isOwner: boolean;
  groupId: string;
}) => {
  const { group } = useGroupDetail(groupId);

  const { leaveGroup, isPending } = useLeaveGroup();

  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOwner) {
      toast.error('오너는 그룹을 나갈 수 없습니다.');
      return;
    }
    setIsOpen(true);
  };

  const handleLeaveGroup = async () => {
    await leaveGroup({ groupId });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="tw-w-full !tw-justify-start tw-gap-2 tw-text-destructive"
          onClick={handleOpen}
        >
          <LogOut className="tw-h-4 tw-w-4" />
          <span className="tw-text-sm tw-font-medium">그룹 나가기</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="!tw-max-w-[300px] sm:!tw-max-w-sm">
        <DialogHeader>
          <DialogTitle>{group?.name}을 나가시겠습니까?</DialogTitle>
        </DialogHeader>
        <DialogFooter className="tw-gap-2">
          <Button
            variant="destructive"
            onClick={handleLeaveGroup}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="tw-h-4 tw-w-4 tw-animate-spin" />
            ) : (
              '예'
            )}
          </Button>
          <DialogClose asChild>
            <Button variant="outline">아니오</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
