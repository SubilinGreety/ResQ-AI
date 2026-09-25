import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to MySQL database via Prisma successfully.');
  } catch (error) {
    console.error('❌ Failed to connect to MySQL database:', error);
    process.exit(1);
  }
}
