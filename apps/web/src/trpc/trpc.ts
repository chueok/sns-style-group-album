import { createTRPCReact } from '@trpc/react-query';
import type { TrpcAppRouter } from '@repo/server/app-router-type'; // tsconfig 의 path 설정 참고

export const trpc = createTRPCReact<TrpcAppRouter>();
