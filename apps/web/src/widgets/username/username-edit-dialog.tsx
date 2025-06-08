import { DialogFooter } from '@repo/ui/dialog';
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

const usernameFormSchema = z.object({
  username: z.string().min(1, '최소 1자 이상 입력해주세요.'),
});

export const UsernameEditDialog = ({
  isInitial,
  close,
}: {
  isInitial: boolean;
  close: () => void;
}) => {
  const form = useForm<z.infer<typeof usernameFormSchema>>({
    resolver: zodResolver(usernameFormSchema),
    defaultValues: {
      username: '',
    },
  });

  const { editUsername } = useAuth();

  const onSubmit = (values: z.infer<typeof usernameFormSchema>) => {
    console.log(values);
    editUsername(values.username);
    close();
  };

  const title = isInitial ? '이름을 정해주세요.' : '이름을 수정해주세요.';

  return (
    <DialogContent pinned={isInitial} className="tw-w-[300px] sm:tw-w-[448px]">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
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
  );
};
