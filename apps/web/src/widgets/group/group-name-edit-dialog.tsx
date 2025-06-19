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
import { Button } from '@repo/ui/button';
import { DialogContent } from '@repo/ui/dialog';
import { Form } from '@repo/ui/form';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/trpc/hooks/auth/use-auth';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useChangeGroupName } from '@/trpc/hooks/group/use-change-group-name';
import { Loader2, Pen } from 'lucide-react';
import { useEffect, useState } from 'react';

const groupnameFormSchema = z.object({
  groupname: z.string().min(1, '최소 1자 이상 입력해주세요.'),
});

export const GroupNameEditDialog = (payload: { groupId: string }) => {
  const { changeGroupName, isPending } = useChangeGroupName();

  const form = useForm<z.infer<typeof groupnameFormSchema>>({
    resolver: zodResolver(groupnameFormSchema),
    defaultValues: {
      groupname: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof groupnameFormSchema>) => {
    if (payload.groupId === '') {
      return;
    }

    await changeGroupName({
      groupId: payload.groupId,
      name: values.groupname,
    });

    setIsOpen(false);
    form.reset();
  };

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    form.reset();
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="tw-w-full !tw-justify-start tw-gap-2"
        >
          <Pen className="tw-h-4 tw-w-4 tw-text-muted-foreground" />
          <span className="tw-text-sm tw-font-medium tw-text-muted-foreground">
            그룹명 변경
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent pinned className="!tw-max-w-[300px] sm:!tw-max-w-sm">
        <DialogHeader>
          <DialogTitle>그룹명 변경</DialogTitle>
          <VisuallyHidden>
            <DialogDescription>Change the group name.</DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="tw-space-y-4">
            <FormField
              control={form.control}
              name="groupname"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="sm:tw-justify-start tw-gap-2">
              <DialogClose asChild>
                <Button variant="outline">취소</Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                확인
                {isPending && <Loader2 className="tw-h-4 tw-w-4 tw-ml-2" />}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
