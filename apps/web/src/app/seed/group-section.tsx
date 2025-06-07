'use client';
import { Button } from '@repo/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/card';
import { UserPlus, Trash2, Loader2, Users, PenLine } from 'lucide-react';
import {
  useChangeGroupName,
  useCreateSeedGroup,
  useDeleteGroup,
} from '@/trpc/hooks/seed/group';
import { trpc } from '@/trpc/trpc';
import { AddMemberDialog } from './add-member-dialog';

const GroupMemberCountLabel = ({ groupId }: { groupId: string }) => {
  const { data: groupMembers = [] } = trpc.seed!.getGroupMembers.useQuery({
    groupId,
  });
  return (
    <span className="tw-text-xs tw-text-muted-foreground">
      {groupMembers.length}명
    </span>
  );
};

// TODO : invitiation code에 대한 기능 구현 할 것
export const GroupSection = () => {
  /**
   * group
   */
  const { createGroup, isPending: isCreateGroupPending } = useCreateSeedGroup();
  const createGroupFormAction = async (formData: FormData) => {
    const name = formData.get('name') as string;
    await createGroup({ name });
  };

  const { data: groups = [] } = trpc.seed!.getGroups.useQuery();

  const { data: users = [] } = trpc.seed!.getUsers.useQuery();

  const { changeGroupName, isPending: isChangeGroupNamePending } =
    useChangeGroupName();
  const changeGroupNameFormAction = async (formData: FormData) => {
    const groupId = formData.get('groupId') as string;
    const name = formData.get('name') as string;
    await changeGroupName({ groupId, name });
  };

  const { deleteGroup, isPending: isDeleteGroupPending } = useDeleteGroup();
  const deleteGroupFormAction = async (formData: FormData) => {
    const groupId = formData.get('groupId') as string;
    await deleteGroup({ groupId });
  };

  return (
    <>
      {/* 그룹 생성 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="tw-flex tw-items-center tw-gap-2">
            <Users className="tw-h-5 tw-w-5" />새 그룹 생성
          </CardTitle>
          <CardDescription>테스트용 그룹을 빠르게 생성합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createGroupFormAction} className="tw-space-y-4">
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="tw-block tw-text-sm tw-font-medium tw-mb-1"
                >
                  그룹 이름
                </label>
                <input
                  type="name"
                  id="name"
                  name="name"
                  placeholder="그룹 이름"
                  className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="tw-w-full md:tw-w-auto"
              disabled={isCreateGroupPending}
            >
              {isCreateGroupPending ? (
                <Loader2 className="tw-h-4 tw-w-4 tw-mr-2" />
              ) : null}
              <Users className="tw-h-4 tw-w-4 tw-mr-2" />
              그룹 생성
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>그룹 목록 ({groups.length}개)</CardTitle>
          <CardDescription>
            생성된 그룹 목록입니다. 특정 그룹으로 로그인하거나 삭제할 수
            있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <div className="tw-text-center tw-py-8 tw-text-muted-foreground">
              <UserPlus className="tw-h-12 tw-w-12 tw-mx-auto tw-mb-4 tw-opacity-50" />
              <p>생성된 그룹이 없습니다.</p>
              <p className="tw-text-sm">위에서 새 그룹을 생성해보세요.</p>
            </div>
          ) : (
            <div className="tw-grid tw-gap-4">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="tw-flex tw-items-center tw-justify-between tw-p-4 tw-border tw-rounded-lg hover:tw-bg-gray-50 tw-transition-colors"
                >
                  <div className="tw-flex tw-items-center tw-gap-4">
                    <div>
                      <h3 className="tw-font-medium">{group.name}</h3>
                    </div>
                    <div className="tw-flex tw-items-center tw-gap-2">
                      <span className="tw-text-xs tw-text-muted-foreground">
                        ID: {group.id}
                      </span>
                      <span className="tw-text-xs tw-text-muted-foreground">
                        Owner: {group.ownerName}
                      </span>
                      <GroupMemberCountLabel groupId={group.id} />
                    </div>
                  </div>
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <form action={changeGroupNameFormAction}>
                      <input type="hidden" name="groupId" value={group.id} />
                      <input
                        type="text"
                        name="name"
                        className="tw-h-9 tw-w-36 tw-mr-1 tw-border-border tw-border"
                      />
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        disabled={isChangeGroupNamePending}
                      >
                        {isChangeGroupNamePending ? (
                          <Loader2 className="tw-h-4 tw-w-4 tw-mr-2" />
                        ) : null}
                        <PenLine className="tw-h-4 tw-w-4 tw-mr-2" />
                        그룹 이름 변경
                      </Button>
                    </form>
                    <AddMemberDialog
                      groupId={group.id}
                      groupName={group.name}
                      users={users}
                    />
                    <form action={deleteGroupFormAction}>
                      <input type="hidden" name="groupId" value={group.id} />
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        className="tw-text-red-600 hover:tw-text-red-700"
                        disabled={isDeleteGroupPending}
                      >
                        {isDeleteGroupPending ? (
                          <Loader2 className="tw-h-4 tw-w-4 tw-mr-2" />
                        ) : null}
                        <Trash2 className="tw-h-4 tw-w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {/* 빠른 액션 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 액션</CardTitle>
          <CardDescription>
            자주 사용하는 그룹을 빠르게 생성할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
            <form action={createGroupFormAction}>
              <input type="hidden" name="name" value="관리자 그룹" />
              <input
                type="hidden"
                name="description"
                value="시스템 관리자 그룹"
              />
              <Button type="submit" variant="outline" className="tw-w-full">
                관리자 그룹 생성
              </Button>
            </form>
            <form action={createGroupFormAction}>
              <input type="hidden" name="name" value="마케팅팀" />
              <input type="hidden" name="description" value="마케팅 담당 팀" />
              <Button type="submit" variant="outline" className="tw-w-full">
                마케팅팀 생성
              </Button>
            </form>
            <form action={createGroupFormAction}>
              <input type="hidden" name="name" value="개발팀" />
              <input type="hidden" name="description" value="개발 담당 팀" />
              <Button type="submit" variant="outline" className="tw-w-full">
                개발팀 생성
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
