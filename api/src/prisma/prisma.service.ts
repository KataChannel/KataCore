import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('🔗 Prisma connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Prisma disconnected from database');
  }

  // Helper method for safe database operations
  async executeTransaction<T>(fn: (prisma: PrismaService) => Promise<T>): Promise<T> {
    return this.$transaction(fn);
  }

  // Helper method for cleanup in tests
  async cleanup() {
    if (process.env.NODE_ENV === 'test') {
      const tablenames = await this.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename FROM pg_tables WHERE schemaname='public'
      `;

      for (const { tablename } of tablenames) {
        if (tablename !== '_prisma_migrations') {
          try {
            // Use $executeRaw instead of $executeRawUnsafe
            await this.$executeRaw`TRUNCATE TABLE ${tablename} CASCADE`;
          } catch (error) {
            console.log(`Could not truncate ${tablename}:`, error);
          }
        }
      }
    }
  }
}
