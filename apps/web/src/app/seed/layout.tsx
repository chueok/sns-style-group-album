import type { ReactNode } from 'react';

export default function DevLayout({ children }: { children: ReactNode }) {
  // 프로덕션 환경에서는 접근 차단
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="tw-text-red-500 tw-min-h-screen tw-flex tw-items-center tw-justify-center">
        <div className="tw-text-center">
          <h1 className="tw-text-2xl tw-font-bold tw-text-red-600 tw-mb-4">
            접근 금지
          </h1>
          <p className="tw-text-muted-foreground">
            이 페이지는 개발 환경에서만 접근 가능합니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="tw-min-h-screen tw-bg-gray-50">
      <header className="tw-bg-white tw-border-b">
        <div className="tw-container tw-mx-auto tw-px-4 tw-py-4">
          <div className="tw-flex tw-items-center tw-justify-between">
            <h1 className="tw-text-xl tw-font-semibold">개발자 도구</h1>
            <div className="tw-flex tw-items-center tw-gap-4">
              <span className="tw-text-sm tw-text-muted-foreground">
                개발 모드
              </span>
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
