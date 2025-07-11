import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export const useLoginWithOauth = (props: { returnTo: string }) => {
  const redirectUrl = props.returnTo;
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const popupRef = useRef<Window | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data.status === 'success') {
        toast.success('Login successful!');
        setIsPending(false);
        router.replace(redirectUrl);
        router.refresh();
        popupRef.current = null;
      } else if (e.data.status === 'fail') {
        toast.error('Login failed!');
        setIsPending(false);
        popupRef.current = null;
      } else if (e.data.status === 'cancel') {
        // success/fail 과 cancel 메시지가 같이 오기 때문에, cancel 메시지는 1초 뒤에 처리
        setTimeout(() => {
          if (popupRef.current) {
            toast.error('로그인이 취소되었습니다.');
            setIsPending(false);
            popupRef.current = null;
          }
        }, 1000);
      }
    };

    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, [redirectUrl, router]);

  const login = async (input: { authURL: string }) => {
    const url = `${input.authURL}`;
    const width = 500;
    const height = 600;
    const left = screen.width / 2 - width / 2;
    const top = screen.height / 2 - height / 2;
    const features = [
      'toolbar=no',
      'location=no',
      'directories=no',
      'status=no',
      'menubar=no',
      'scrollbars=yes',
      'resizable=yes',
      'copyhistory=no',
      `width=${width}`,
      `height=${height}`,
      `top=${top}`,
      `left=${left}`,
    ].join(',');

    try {
      // 이미 열린 팝업이 있다면 닫기
      if (popupRef.current) {
        popupRef.current.close();
      }

      const popup = window.open(url, 'oauth_popup', features);
      if (!popup) {
        toast.error('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
        return;
      }
      popupRef.current = popup;
      setIsPending(true);
    } catch (error) {
      console.error('Error opening popup:', error);
      toast.error('팝업을 열 수 없습니다.');
      setIsPending(false);
    }
  };

  return { isPending, login };
};
