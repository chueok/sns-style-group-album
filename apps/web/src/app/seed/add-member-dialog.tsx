'use client';

import { useState } from 'react';
import { Button } from '@repo/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/dialog';
import { UserPlus2, Search, Loader2 } from 'lucide-react';
import { trpc } from '@/trpc/trpc';
import { useAddGroupMember } from '@/trpc/hooks/seed/group';

type User = {
  id: string;
  username: string | null;
};

type AddMemberDialogProps = {
  groupId: string;
  groupName: string;
  users: User[];
};

export function AddMemberDialog({
  groupId,
  groupName,
  users,
}: AddMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: groupMembers = [] } = trpc.seed!.getGroupMembers.useQuery({
    groupId,
  });

  const { addGroupMember, isPending: isAddGroupMemberPending } =
    useAddGroupMember();

  // 그룹에 속하지 않은 사용자만 필터링
  const availableUsers = users.filter(
    (user) => !groupMembers.some((member) => member.userId === user.id)
  );

  // 검색어로 필터링
  const filteredUsers = availableUsers.filter(
    (user) =>
      user.username &&
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleAddUser(formData: FormData) {
    const groupId = formData.get('groupId') as string;
    const userId = formData.get('userId') as string;
    await addGroupMember({ groupId, userIdList: [userId] });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus2 className="tw-h-4 tw-w-4 tw-mr-2" />
          사용자 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:tw-max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{groupName} 그룹에 사용자 추가</DialogTitle>
          <DialogDescription>
            그룹에 추가할 사용자를 선택하세요. 이름이나 이메일로 검색할 수
            있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="tw-relative tw-mt-2 tw-mb-4">
          <Search className="tw-absolute tw-left-2 tw-top-2.5 tw-h-4 tw-w-4 tw-text-muted-foreground" />
          <input
            type="text"
            placeholder="이름 또는 이메일로 검색..."
            className="tw-pl-8 tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="tw-max-h-[300px] tw-overflow-y-auto tw-border tw-rounded-md">
          {availableUsers.length === 0 ? (
            <div className="tw-p-4 tw-text-center tw-text-muted-foreground">
              <p>추가할 수 있는 사용자가 없습니다.</p>
              <p className="tw-text-sm tw-mt-1">먼저 사용자를 생성해주세요.</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="tw-p-4 tw-text-center tw-text-muted-foreground">
              <p>검색 결과가 없습니다.</p>
              <p className="tw-text-sm tw-mt-1">다른 검색어로 시도해보세요.</p>
            </div>
          ) : (
            <div className="tw-divide-y">
              {filteredUsers.map((user) => (
                <form
                  key={user.id}
                  action={handleAddUser}
                  className="tw-flex tw-items-center tw-justify-between tw-p-3 hover:tw-bg-gray-50"
                >
                  <input type="hidden" name="groupId" value={groupId} />
                  <input type="hidden" name="userId" value={user.id} />
                  <div>
                    <p className="tw-font-medium">{user.username}</p>
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isAddGroupMemberPending}
                  >
                    {isAddGroupMemberPending ? (
                      <Loader2 className="tw-h-4 tw-w-4 tw-mr-2" />
                    ) : null}
                    추가
                  </Button>
                </form>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
