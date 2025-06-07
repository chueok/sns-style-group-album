'use client';
import { Button } from '@repo/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/avatar';
import { UserPlus, LogIn, Trash2, Loader2, PenLine } from 'lucide-react';
import {
  useChangeUsername,
  useCreateSeedUser,
  useDeleteSeedUser,
} from '@/trpc/hooks/seed/user';
import { trpc } from '@/trpc/trpc';

export const UserSection = () => {
  const { createUser, isPending: isCreatePending } = useCreateSeedUser();

  const createUserFormAction = async (formData: FormData) => {
    const provider = formData.get('provider') as string;
    const providerId = formData.get('providerId') as string;
    await createUser({ provider, providerId });
  };

  const { deleteUser, isPending: isDeletePending } = useDeleteSeedUser();

  const deleteUserFormAction = async (formData: FormData) => {
    const userId = formData.get('userId') as string;
    await deleteUser({ id: userId });
  };

  const { mutateAsync: login } = trpc.seed!.login.useMutation();
  const loginFormAction = async (formData: FormData) => {
    const userId = formData.get('userId') as string;
    await login({ userId });
  };

  const { changeUsername, isPending: isChangeUsernamePending } =
    useChangeUsername();
  const changeUsernameFormAction = async (formData: FormData) => {
    const userId = formData.get('userId') as string;
    const username = formData.get('username') as string;
    await changeUsername({ id: userId, username });
  };

  const { data: users = [] } = trpc.seed!.getUsers.useQuery();

  return (
    <>
      {/* 유저 생성 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="tw-flex tw-items-center tw-gap-2">
            <UserPlus className="tw-h-5 tw-w-5" />새 유저 생성
          </CardTitle>
          <CardDescription>테스트용 유저를 빠르게 생성합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createUserFormAction} className="tw-space-y-4">
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
              {/* <div>
                <label
                  htmlFor="username"
                  className="tw-block tw-text-sm tw-font-medium tw-mb-1"
                >
                  이름
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="홍길동"
                  className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div> */}
              <div>
                <label
                  htmlFor="provider"
                  className="tw-block tw-text-sm tw-font-medium tw-mb-1"
                >
                  Provider
                </label>
                <select
                  id="provider"
                  name="provider"
                  className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="google"
                >
                  <option value="google">google</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="providerId"
                  className="tw-block tw-text-sm tw-font-medium tw-mb-1"
                >
                  ProviderId
                </label>
                <input
                  type="providerId"
                  id="providerId"
                  name="providerId"
                  placeholder="1234567890"
                  className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="tw-w-full md:tw-w-auto"
              disabled={isCreatePending}
            >
              {isCreatePending ? (
                <Loader2 className="tw-h-4 tw-w-4 tw-mr-2" />
              ) : null}
              <UserPlus className="tw-h-4 tw-w-4 tw-mr-2" />
              유저 생성
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 유저 목록 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>유저 목록 ({users.length}명)</CardTitle>
          <CardDescription>
            생성된 유저 목록입니다. 특정 유저로 로그인하거나 삭제할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="tw-text-center tw-py-8 tw-text-muted-foreground">
              <UserPlus className="tw-h-12 tw-w-12 tw-mx-auto tw-mb-4 tw-opacity-50" />
              <p>생성된 유저가 없습니다.</p>
              <p className="tw-text-sm">위에서 새 유저를 생성해보세요.</p>
            </div>
          ) : (
            <div className="tw-grid tw-gap-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="tw-flex tw-items-center tw-justify-between tw-p-4 tw-border tw-rounded-lg hover:tw-bg-gray-50 tw-transition-colors"
                >
                  <div className="tw-flex tw-items-center tw-gap-4">
                    <Avatar>
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                      />
                      <AvatarFallback>
                        {user.username ||
                          ''
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="tw-font-medium">{user.username}</h3>
                      {/* <p className="tw-text-sm tw-text-muted-foreground">
                        {user.email}
                      </p> */}
                      <div className="tw-flex tw-items-center tw-gap-2 tw-mt-1">
                        {/* <Badge
                          variant={
                            user.role === 'admin' ? 'default' : 'secondary'
                          }
                        >
                          {user.role}
                        </Badge> */}
                        <span className="tw-text-xs tw-text-muted-foreground">
                          ID: {user.id}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <form action={changeUsernameFormAction}>
                      <input type="hidden" name="userId" value={user.id} />
                      <input
                        type="text"
                        name="username"
                        className="tw-h-9 tw-w-36 tw-mr-1 tw-border-border tw-border"
                      />
                      <Button type="submit" variant="outline" size="sm">
                        <PenLine className="tw-h-4 tw-w-4 tw-mr-2" />
                        유저네임 변경
                      </Button>
                    </form>
                    <form action={loginFormAction}>
                      <input type="hidden" name="userId" value={user.id} />
                      <Button type="submit" variant="outline" size="sm">
                        <LogIn className="tw-h-4 tw-w-4 tw-mr-2" />
                        로그인
                      </Button>
                    </form>
                    <form action={deleteUserFormAction}>
                      <input type="hidden" name="userId" value={user.id} />
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        className="tw-text-red-600 hover:tw-text-red-700"
                      >
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
      <Card>
        <CardHeader>
          <CardTitle>빠른 액션</CardTitle>
          <CardDescription>
            자주 사용하는 작업들을 빠르게 실행할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
            <form action={createUserFormAction}>
              <input type="hidden" name="name" value="관리자" />
              <input type="hidden" name="email" value="admin@example.com" />
              <input type="hidden" name="role" value="admin" />
              <Button type="submit" variant="outline" className="tw-w-full">
                관리자 계정 생성
              </Button>
            </form>
            <form action={createUserFormAction}>
              <input type="hidden" name="name" value="테스트 유저" />
              <input type="hidden" name="email" value="test@example.com" />
              <input type="hidden" name="role" value="user" />
              <Button type="submit" variant="outline" className="tw-w-full">
                테스트 유저 생성
              </Button>
            </form>
            <Button variant="outline" className="tw-w-full" disabled>
              모든 유저 삭제
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
