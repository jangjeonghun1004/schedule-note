import { PrismaClient } from '@prisma/client';

// PrismaClient는 전역 싱글톤으로 관리합니다.
// 이를 통해 불필요한 연결 생성을 방지합니다.
// https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices

const globalForPrisma = global as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 