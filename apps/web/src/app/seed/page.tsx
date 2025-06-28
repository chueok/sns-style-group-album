'use client';
import { Badge } from '@repo/ui/badge';
import { UserSection } from './user-section';
import { GroupSection } from './group-section';
import { Tabs } from '@repo/ui/tabs';
import { TabsContent, TabsTrigger } from '@repo/ui/tabs';
import { TabsList } from '@repo/ui/tabs';
import { AllSection } from './all-section';

// 개발 환경에서만 접근 가능하도록 체크
if (process.env.NODE_ENV === 'production') {
  throw new Error('This page is only available in development mode');
}

export default function SeedDataPage() {
  return (
    <div className="tw-container tw-mx-auto tw-py-8 tw-space-y-8">
      <div className="tw-flex tw-items-center tw-justify-between">
        <div>
          <h1 className="tw-text-3xl tw-font-bold">개발용 Seed 데이터 관리</h1>
          <p className="tw-text-muted-foreground tw-mt-2">
            개발 환경에서 테스트용 유저를 생성하고 관리합니다
          </p>
        </div>
        <Badge
          variant="secondary"
          className="tw-bg-yellow-100 tw-text-yellow-800"
        >
          개발 모드
        </Badge>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="all">통합 관리</TabsTrigger>
          <TabsTrigger value="users">사용자 관리</TabsTrigger>
          <TabsTrigger value="groups">그룹 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <AllSection />
        </TabsContent>
        <TabsContent value="users" className="space-y-6">
          <UserSection />
        </TabsContent>
        <TabsContent value="groups" className="space-y-6">
          <GroupSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
