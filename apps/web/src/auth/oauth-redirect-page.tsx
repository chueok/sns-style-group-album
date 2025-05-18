'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

const OauthRedirectPage = () => {
  const searchParams = useSearchParams();
  const isError = searchParams.get('error');

  useEffect(() => {
    const sendMessageToParent = () => {
      try {
        if (window.opener) {
          console.log('Attempting to send message to parent window');
          if (isError) {
            window.opener.postMessage({ status: 'fail' }, '*');
          } else {
            window.opener.postMessage({ status: 'success' }, '*');
          }
          window.close();
        } else {
          console.error('No opener window found');
        }
      } catch (error) {
        console.error('Error sending message to parent:', error);
      }
    };

    // 약간의 지연을 주어 window.opener가 설정될 시간을 줍니다
    setTimeout(sendMessageToParent, 100);
  }, [isError]);

  return <div>Processing login...</div>;
};

// TODO: Suspense fallback 구현
const WrrappedOauthPopupPage = () => {
  return (
    <Suspense>
      <OauthRedirectPage />
    </Suspense>
  );
};

export default WrrappedOauthPopupPage;
