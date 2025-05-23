import { PrismaClient } from '@prisma/client';

// PrismaClient는 전역 싱글톤으로 관리합니다.
// 이를 통해 불필요한 연결 생성을 방지합니다.
// https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices

// 타입 확장을 통해 Todo, Memo 모델에 대한 접근 허용
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Prisma 클라이언트 인스턴스 생성
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// 개발 환경에서만 전역 객체에 할당
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export { prisma }; 