'use client';

import { Button } from '@repo/ui/button';
import { Check, Users } from 'lucide-react';
import {
  useGroupDetail,
  useGroupList,
} from '@/trpc/hooks/group/use-group-list';
import { useGroupStore } from '@/store/group-store';
import { GroupCreationFlowDialog } from '@/widgets/group/group-creation-flow-dialog';

const GroupItem = ({ groupId }: { groupId: string }) => {
  const { group } = useGroupDetail(groupId);
  const setSelectedGroupId = useGroupStore((state) => state.setSelectedGroupId);
  const selectedGroupId = useGroupStore((state) => state.selectedGroupId);

  if (!group) {
    return null;
  }

  const isSelected = selectedGroupId === group.id;

  return (
    <Button
      key={group.id}
      variant="ghost"
      className="tw-w-full !tw-justify-start tw-gap-2"
      onClick={() => setSelectedGroupId(group.id)}
    >
      {isSelected ? (
        <Check className="tw-h-3 tw-w-3 tw-text-green-600" />
      ) : (
        <Check className="tw-h-3 tw-w-3 tw-opacity-0" />
      )}
      <span className={`tw-text-sm ${isSelected ? 'tw-font-medium' : ''}`}>
        {group?.name || ''}
      </span>
    </Button>
  );
};

export const GroupList = () => {
  const { groups } = useGroupList();

  return (
    <>
      <div className="tw-flex tw-items-center tw-gap-2">
        <Users className="tw-h-4 tw-w-4 tw-text-muted-foreground" />
        <span className="tw-text-sm tw-font-medium tw-text-muted-foreground">
          그룹 목록
        </span>
        <GroupCreationFlowDialog />
      </div>
      <div className="tw-ml-2">
        {groups.map((group) => {
          return <GroupItem key={group.id} groupId={group.id} />;
        })}
      </div>
    </>
  );
};
