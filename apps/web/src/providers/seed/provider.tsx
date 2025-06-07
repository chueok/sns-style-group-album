'use client';

import { useAuth } from '@/trpc/hooks/auth/use-auth';
import { useCreateGroup } from '@/trpc/hooks/group/use-create-group';
import { useCreateSeedGroup } from '@/trpc/hooks/seed/group';
import { useChangeUsername, useCreateSeedUser } from '@/trpc/hooks/seed/user';
import { trpc } from '@/trpc/trpc';
import { useEffect } from 'react';

const SEED_EXECUTED_KEY = 'seed_executed';

export const SeedComponent = () => {
  const { createUser } = useCreateSeedUser();
  const { changeUsername } = useChangeUsername();
  const { user, editUsername } = useAuth();
  const { createGroup } = useCreateGroup();
  const { mutateAsync: generateSeedMedia } =
    trpc.seed!.generateSeedMedia.useMutation();

  useEffect(() => {
    (async () => {
      const isAlreadyRun = localStorage.getItem(SEED_EXECUTED_KEY) === 'true';

      if (isAlreadyRun) {
        return;
      }

      const { id: userId } = await createUser({
        provider: 'google',
      });

      await editUsername('test user');

      const { id: groupId } = await createGroup('test group');

      await generateSeedMedia({
        groupId,
        ownerId: userId,
      });

      localStorage.setItem(SEED_EXECUTED_KEY, 'true');
    })();
  }, []);

  return <></>;
};
