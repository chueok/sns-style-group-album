import { useGroupStore } from '@/store/group-store';
import { useAuth } from '@/trpc/hooks/auth/use-auth';
import { useGroupDetail } from '@/trpc/hooks/group/use-group-list';
import { useMemberList } from '@/trpc/hooks/group/use-member';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/avatar';
import { Button } from '@repo/ui/button';
import { Card, CardContent } from '@repo/ui/card';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@repo/ui/drawer';
import { Separator } from '@repo/ui/separator';
import { Switch } from '@repo/ui/switch';
import { Bell, Cake, ChevronLeft, Crown, Info, Users } from 'lucide-react';
import { useState } from 'react';
import { GroupNameEditDialog } from './group-name-edit-dialog';
import { GroupInvitationDialog } from './group-invitation-dialog';
import { GroupLeaveConfirmDialog } from './group-leave-confirm-dialog';
import { useMyMemberInfo } from '@/trpc/hooks/group/use-my-member-info';

const ErrorComponent = () => {
  return <div>Error</div>;
};

const MemberItemComponent = ({
  username,
  profileImageUrl,
  isOwner,
}: {
  id: string;
  username: string;
  profileImageUrl?: string;
  isOwner: boolean;
}) => {
  return (
    <div className="tw-flex tw-flex-row tw-items-center tw-gap-4">
      <div className="tw-relative">
        <Avatar className="tw-h-8 tw-w-8">
          <AvatarImage src={profileImageUrl} />
          <AvatarFallback>{username.slice(0, 2)}</AvatarFallback>
        </Avatar>
        {isOwner && (
          <Crown className="tw-absolute tw-bottom-0 tw-right-0 tw-h-4 tw-w-4 tw-text-yellow-500 tw-fill-yellow-500" />
        )}
      </div>
      <span>{username}</span>
    </div>
  );
};

export const EditGroupDrawer = () => {
  // groupId 가 undefined인 경우는 버튼이 비활성화 되어 이 페이지가 열리지 않음
  const selectedGroupId = useGroupStore((state) => state.selectedGroupId);
  const { group } = useGroupDetail(selectedGroupId || '');
  const { memberList } = useMemberList({
    groupId: selectedGroupId || '',
  }); // TODO: infinite scroll 구현 필요 (page 기반)

  const { memberInfo } = useMyMemberInfo(selectedGroupId);

  const isOwner = memberInfo?.role === 'owner';

  const handleSelectedGroupDetail = () => {
    console.log('selected group detail');
  };

  // 알림 설정 상태 관리
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const handleNotificationToggle = () => {
    setIsNotificationEnabled(!isNotificationEnabled);
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Drawer
      direction="bottom"
      open={isOpen}
      onOpenChange={setIsOpen}
      dismissible={false}
    >
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          className="tw-w-full !tw-justify-start tw-gap-2"
          onClick={handleSelectedGroupDetail}
          disabled={!selectedGroupId}
        >
          <Info className="tw-h-4 tw-w-4 tw-text-muted-foreground" />
          <span className="tw-text-sm tw-font-medium tw-text-muted-foreground">
            선택된 그룹 상세 정보
          </span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="tw-m-0 !tw-rounded-none !tw-w-screen !tw-h-screen !tw-max-h-screen">
        {group ? (
          <>
            <DrawerHeader>
              <div className="tw-flex tw-items-center tw-justify-between">
                <DrawerClose onClick={() => setIsOpen(false)}>
                  <ChevronLeft className="tw-h-6 tw-w-6 tw-text-muted-foreground" />
                </DrawerClose>
                <DrawerTitle>{group.name} 상세정보</DrawerTitle>
                <ChevronLeft className="tw-h-6 tw-w-6 tw-invisible" />
              </div>
            </DrawerHeader>
            <Separator />
            <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-gap-2 tw-px-4 tw-py-2">
              <div className="tw-flex tw-flex-row tw-gap-2">
                <Cake className="tw-h-4 tw-w-4 tw-text-muted-foreground" />
                <span className="tw-text-sm tw-font-medium tw-text-muted-foreground">
                  그룹 생성일
                </span>
              </div>
              <span className="tw-text-sm tw-font-medium tw-text-muted-foreground">
                {group.createdDateTime
                  .toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })
                  .replace(/\. /g, '.')
                  .replace(/\.$/, '')}
              </span>
            </div>
            <Button
              variant="ghost"
              className="tw-w-full !tw-justify-between tw-gap-2"
              onClick={handleNotificationToggle}
            >
              <div className="tw-flex tw-flex-row tw-gap-2">
                <Bell className="tw-h-4 tw-w-4 tw-text-muted-foreground" />
                <span className="tw-text-sm tw-font-medium tw-text-muted-foreground">
                  그룹 알림 설정
                </span>
              </div>
              <Switch checked={isNotificationEnabled} />
            </Button>
            {isOwner && <GroupNameEditDialog groupId={group.id} />}
            <div>
              <div className="tw-flex tw-flex-row tw-items-center tw-justify-start tw-gap-2 tw-px-4 tw-py-2">
                <Users className="tw-h-4 tw-w-4 tw-text-muted-foreground" />
                <span className="tw-text-sm tw-font-medium tw-text-muted-foreground">
                  그룹 멤버
                </span>
              </div>
              <Card className="tw-mx-4 tw-py-2">
                <CardContent className="tw-flex tw-flex-col tw-gap-2 tw-py-0">
                  <GroupInvitationDialog groupId={group.id} />
                  {memberList.map((memberProfile) => {
                    const isOwner = memberProfile.role === 'owner';
                    return (
                      <MemberItemComponent
                        key={memberProfile.id}
                        id={memberProfile.id}
                        username={memberProfile.username}
                        profileImageUrl={
                          memberProfile.profileImageUrl || undefined
                        }
                        isOwner={isOwner}
                      />
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            <GroupLeaveConfirmDialog isOwner={isOwner} groupId={group.id} />
          </>
        ) : (
          <ErrorComponent />
        )}
      </DrawerContent>
    </Drawer>
  );
};
