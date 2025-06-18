import { Dialog, DialogDescription, DialogFooter } from '@repo/ui/dialog';
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

const usernameFormSchema = z.object({
  username: z.string().min(1, '최소 1자 이상 입력해주세요.'),
});

export const InitialUsernameEditDialog = () => {
  const { editUsername } = useAuth();

  const form = useForm<z.infer<typeof usernameFormSchema>>({
    resolver: zodResolver(usernameFormSchema),
    defaultValues: {
      username: '',
    },
  });

  const onSubmit = (values: z.infer<typeof usernameFormSchema>) => {
    editUsername(values.username);
  };

  return (
    <Dialog open={true}>
      <DialogContent pinned className="tw-w-[300px] sm:tw-w-[448px]">
        <DialogHeader>
          <DialogTitle>이름을 정해주세요.</DialogTitle>
          <VisuallyHidden>
            <DialogDescription>
              Make a group name to invite your friends.
            </DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="tw-space-y-4">
            <FormField
              control={form.control}
              name="username"
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
    </Dialog>
  );
};
