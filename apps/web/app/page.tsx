import Image from "next/image";
import { Button } from "@repo/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/accordion";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
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
