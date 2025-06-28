'use client';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { Card, CardContent } from '@repo/ui/card';
import { getBackendUrl } from '../../utils';
import { useLoginWithOauth } from '@/auth/use-login-with-oauth';

export default function LoginPage() {
  const { isPending, login } = useLoginWithOauth({
    returnTo: '/group',
  });
  const loading = isPending;

  const handleLogin = (provider: 'google' | 'apple') => {
    if (provider === 'google') {
      login({ authURL: `${getBackendUrl()}/auth/login/${provider}` });
    }
  };

  return (
    <div className="tw-flex tw-justify-center tw-items-center tw-min-h-screen tw-bg-gray-100 dark:tw-bg-gray-900">
      <Card className="tw-w-full tw-max-w-sm tw-p-6 tw-bg-white dark:tw-bg-gray-800 tw-rounded-2xl tw-shadow-lg">
        <CardContent className="tw-text-center">
          <h2 className="tw-text-xl tw-font-semibold tw-text-gray-900 dark:tw-text-white tw-mb-4">
            로그인하여 시작하기
          </h2>
          <p className="tw-text-gray-600 dark:tw-text-gray-300 tw-mb-6 tw-text-sm">
            Google 또는 Apple 계정으로 로그인하세요.
          </p>
          <div className="tw-space-y-3">
            <Button
              onClick={() => handleLogin('google')}
              className="tw-w-full tw-flex tw-items-center tw-gap-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="tw-animate-spin" />
              ) : (
                <FcGoogle className="tw-text-xl" />
              )}
              Google 로그인
            </Button>
            <Button
              onClick={() => handleLogin('apple')}
              className="tw-w-full tw-flex tw-items-center tw-gap-2 tw-bg-black tw-text-white"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="tw-animate-spin" />
              ) : (
                <FaApple className="tw-text-xl" />
              )}
              Apple 로그인
            </Button>
          </div>
          {loading ? (
            <p className="tw-text-sm tw-text-gray-500 tw-mt-4">로그인 중...</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
