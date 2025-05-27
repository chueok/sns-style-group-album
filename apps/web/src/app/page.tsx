'use client';

import Image from 'next/image';
import { Button } from '@repo/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/ui/accordion';
import styles from './page.module.css';
import { useDialog } from '@/providers/dialog-provider';
import { InitialUsernameDialog } from '@/widgets/username/initial-username-dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@repo/ui/tabs';
import { ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { useFloatingFunction } from '@/providers/floating-provider/context';

export default function Home() {
  const dialog = useDialog();

  const openDialog = () =>
    dialog.open(({ isOpen, close }) => <InitialUsernameDialog close={close} />);

  const { setNode, setIsVisible, setPosition } = useFloatingFunction();

  useEffect(() => {
    setNode(
      <Button variant="outline" size="icon">
        <ChevronRight />
      </Button>
    );
    setPosition({ anchorPoint: 'bottom-right', x: 50, y: 50 });
    setIsVisible(true);
  }, []);

  return (
    <div className={`${styles.page} tw-relative`}>
      {/* <div className="tw-absolute tw-bottom-4 tw-left-4 tw-z-50">
        <Button variant="outline" size="icon">
          <ChevronRight />
        </Button>
      </div> */}

      <Button onClick={openDialog}>Initial Username</Button>
      <Tabs defaultValue="home" className="tw-w-full">
        <TabsList className="tw-grid tw-w-full tw-grid-cols-5">
          <TabsTrigger value="home">홈</TabsTrigger>
          <TabsTrigger value="album">앨범</TabsTrigger>
          <TabsTrigger value="story">스토리</TabsTrigger>
          <TabsTrigger value="bucket">버킷</TabsTrigger>
          <TabsTrigger value="calendar">캘린더</TabsTrigger>
        </TabsList>
        <TabsContent value="home">
          <div>홈</div>
        </TabsContent>
        <TabsContent value="album">
          <div>앨범</div>
        </TabsContent>
        <TabsContent value="story">
          <div>스토리</div>
        </TabsContent>
        <TabsContent value="bucket">
          <div>버킷</div>
        </TabsContent>
        <TabsContent value="calendar">
          <div>캘린더</div>
        </TabsContent>
      </Tabs>

      <main className={styles.main}>
        <Image
          alt="Next.js logo"
          className={styles.logo}
          src="/next.svg"
          height={38}
          priority
          width={180}
        />
        <ol>
          <li>
            Get started by editing <code>app/page.tsx</code>
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image
              alt="Vercel logomark"
              className={styles.logo}
              height={20}
              src="/vercel.svg"
              width={20}
            />
            Deploy now
          </a>
          <a
            className={styles.secondary}
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            rel="noopener noreferrer"
            target="_blank"
          >
            Read our docs
          </a>
        </div>
        <Button>shadcn/ui</Button>
        <Accordion collapsible defaultValue="title" type="single">
          <AccordionItem value="title">
            <AccordionTrigger>test</AccordionTrigger>
            <AccordionContent>content</AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          rel="noopener noreferrer"
          target="_blank"
        >
          <Image
            alt="File icon"
            aria-hidden
            height={16}
            src="/file-text.svg"
            width={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          rel="noopener noreferrer"
          target="_blank"
        >
          <Image
            alt="Window icon"
            aria-hidden
            height={16}
            src="/window.svg"
            width={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          rel="noopener noreferrer"
          target="_blank"
        >
          <Image
            alt="Globe icon"
            aria-hidden
            height={16}
            src="/globe.svg"
            width={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
