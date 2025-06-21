'use client';

import { Button } from '@repo/ui/button';
import { Check, Files, Plus, Users } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@repo/ui/dialog';
import { FormMessage } from '@repo/ui/form';
import { FormControl, FormItem } from '@repo/ui/form';
import { FormField } from '@repo/ui/form';
import { Input } from '@repo/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogTitle } from '@repo/ui/dialog';
import { DialogHeader } from '@repo/ui/dialog';
import { DialogContent } from '@repo/ui/dialog';
import { Form } from '@repo/ui/form';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useCreateGroup } from '@/trpc/hooks/group/use-create-group';
import { useEffect, useState } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { GroupInvitationDialogContent } from './group-invitation-dialog-content';

const createGroupFormSchema = z.object({
  name: z.string().min(1, '최소 1자 이상 입력해주세요.'),
});

export const GroupCreationFlowDialog = () => {
  const [newGroup, setNewGroup] = useState<Awaited<
    ReturnType<typeof createGroup>
  > | null>(null);

  const form = useForm<z.infer<typeof createGroupFormSchema>>({
    resolver: zodResolver(createGroupFormSchema),
    defaultValues: {
      name: '',
    },
  });

  const { createGroup } = useCreateGroup();

  const onSubmit = async (values: z.infer<typeof createGroupFormSchema>) => {
    const newGroup = await createGroup({ name: values.name });
    setNewGroup(newGroup);
  };

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setNewGroup(null);
    form.reset();
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="tw-h-6 tw-w-6 tw-ml-auto"
        >
          <Plus className="tw-h-3 tw-w-3" />
        </Button>
      </DialogTrigger>

      <DialogContent className="!tw-max-w-[300px] sm:!tw-max-w-sm">
        {!newGroup ? (
          <>
            <DialogHeader>
              <DialogTitle>그룹 이름을 정해주세요.</DialogTitle>
              <VisuallyHidden>
                <DialogDescription>
                  Make a group name to invite your friends.
                </DialogDescription>
              </VisuallyHidden>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="tw-space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="sm:tw-justify-start">
                  <Button type="submit">확인</Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <GroupInvitationDialogContent groupId={newGroup.id} />
        )}
      </DialogContent>
    </Dialog>
  );
};
