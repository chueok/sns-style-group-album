import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export const useLoginWithOauth = (props: { returnTo: string }) => {
  const redirectUrl = props.returnTo;

  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data.status === 'success') {
        toast.success('Login successful!');

        router.replace(redirectUrl);
        router.refresh();
      } else if (e.data.status === 'fail') {
        toast.error('Login failed!');
        setIsPending(false);
      }
    };

    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [redirectUrl, router]);

  const login = async (input: { authURL: string }) => {
    const url = `${input.authURL}`;
    const width = 500;
    const height = 600;
    const left = screen.width / 2 - width / 2;
    const top = screen.height / 2 - height / 2;
    const loginWindow = window.open(
      url,
      '_blank',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    setIsPending(true);

    intervalRef.current = setInterval(() => {
      if (loginWindow?.closed) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setIsPending(false);
        toast.error('로그인에 실패했습니다.');
      }
    }, 500);
  };

  return { isPending, login };
};
