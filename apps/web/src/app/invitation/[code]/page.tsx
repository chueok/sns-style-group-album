'use client';
import { useRequestJoinGroup } from '@/trpc/hooks/group/use-request-join-group';
import { Button } from '@repo/ui/button';
import { Loader2 } from 'lucide-react';

interface InvitationPageProps {
  params: {
    code: string;
  };
}

export default function InvitationPage({ params }: InvitationPageProps) {
  const { code } = params;

  const { requestJoinGroup, isPending } = useRequestJoinGroup();

  return (
    <div>
      <h1>초대 페이지</h1>
      <p>초대 코드: {code}</p>
      <Button onClick={() => requestJoinGroup({ invitationCode: code })}>
        {isPending ? (
          <Loader2 className="tw-h-4 tw-w-4 tw-animate-spin" />
        ) : null}
        초대 수락
      </Button>
    </div>
  );
}
