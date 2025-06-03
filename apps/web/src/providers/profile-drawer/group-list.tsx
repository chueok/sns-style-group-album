'use client';

import { Button } from '@repo/ui/button';
import { Check, Plus, Users } from 'lucide-react';
import { useDialog } from '../dialog-provider';
import { DialogFooter } from '@repo/ui/dialog';
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
import { useGroupList } from '@/trpc/hooks/group/use-group-list';
import { useGroupStore } from '@/store/group-store';

const createGroupFormSchema = z.object({
  name: z.string().min(1, '최소 1자 이상 입력해주세요.'),
});

const CreateGroupDialog = ({ close }: { close: () => void }) => {
  const form = useForm<z.infer<typeof createGroupFormSchema>>({
    resolver: zodResolver(createGroupFormSchema),
    defaultValues: {
      name: '',
    },
  });

  const { createGroup } = useCreateGroup();

  const onSubmit = (values: z.infer<typeof createGroupFormSchema>) => {
    createGroup(values.name);
    close();
  };

  return (
    <DialogContent className="sm:tw-max-w-md">
      <DialogHeader>
        <DialogTitle>그룹 이름을 정해주세요.</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="tw-space-y-4">
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
    </DialogContent>
  );
};

export const GroupList = () => {
  const dialog = useDialog();
  const openDialog = () => {
    dialog.open(({ isOpen, close }) => <CreateGroupDialog close={close} />);
  };

  const groups = useGroupList();

  const { selectedGroupId, setSelectedGroupId } = useGroupStore();

  return (
    <>
      <div className="tw-flex tw-items-center tw-gap-2 tw-mb-3">
        <Users className="tw-h-4 tw-w-4 tw-text-muted-foreground" />
        <span className="tw-text-sm tw-font-medium tw-text-muted-foreground">
          그룹 목록
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="tw-h-6 tw-w-6 tw-ml-auto"
          onClick={openDialog}
          // ref={ref}
        >
          <Plus className="tw-h-3 tw-w-3" />
        </Button>
      </div>
      <div className="tw-ml-2">
        {groups.map((group) => {
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
                <Plus className="tw-h-3 tw-w-3 tw-opacity-0" />
              )}
              <span
                className={`tw-text-sm ${isSelected ? 'tw-font-medium' : ''}`}
              >
                {group?.name || ''}
              </span>
            </Button>
          );
        })}
      </div>
    </>
  );
};
