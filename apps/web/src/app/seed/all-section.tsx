import { useAuth } from '@/trpc/hooks/auth/use-auth';
import { useCreateGroup } from '@/trpc/hooks/group/use-create-group';
import { useChangeUsername, useCreateSeedUser } from '@/trpc/hooks/seed/user';
import { trpc } from '@/trpc/trpc';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { useEffect, useState } from 'react';
import { Progress } from '@repo/ui/progress';
import { useGroupStore } from '@/store/group-store';

const MAX_STEP = 5;
const STEP_LABELS = [
  '유저 생성 중',
  '유저 이름 변경 중',
  '그룹 생성 중',
  '컨텐츠 생성 중',
  '완료',
];

export const AllSection = () => {
  const { createUser } = useCreateSeedUser();
  const { user, editUsername } = useAuth();
  const { createGroup } = useCreateGroup();
  const { mutateAsync: generateSeedMedia } =
    trpc.seed!.generateSeedMedia.useMutation();

  const setGroup = useGroupStore((state) => state.setSelectedGroupId);
  const groupId = useGroupStore((state) => state.selectedGroupId);

  const [step, setStep] = useState(0);
  useEffect(() => {
    const run = async () => {
      if (step === 1) {
        const { id: userId } = await createUser({
          provider: 'google',
        });
        setStep(2);
      } else if (step === 2 && user) {
        await editUsername('test user');
        setStep(3);
        return;
      } else if (step === 3 && user) {
        const { id: groupId } = await createGroup('test group');
        setGroup(groupId);
        setStep(4);
      } else if (step === 4 && user && groupId) {
        await generateSeedMedia({
          groupId,
          ownerId: user.id,
        });
        setStep(5);
      }
    };
    run();
  }, [step, user]);

  const disabled = step !== 0 && step !== MAX_STEP;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>빠른 액션</CardTitle>
          <CardDescription>유저, 그룹, 컨텐츠를 생성합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
            <Button
              onClick={() => setStep(1)}
              type="submit"
              variant="outline"
              className="tw-w-full"
              disabled={disabled}
            >
              생성
            </Button>
          </div>
          {step > 0 && (
            <>
              <Progress
                value={(step / MAX_STEP) * 100}
                className="tw-mt-4 tw-w-full"
              />
              <p className="tw-text-sm tw-text-muted-foreground">
                {STEP_LABELS.at(step - 1) || ''}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
};
