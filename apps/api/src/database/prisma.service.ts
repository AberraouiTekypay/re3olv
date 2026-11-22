import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';

function positiveInteger(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnApplicationShutdown
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL must be configured');
    }
    const protocol = new URL(connectionString).protocol;
    if (protocol !== 'postgres:' && protocol !== 'postgresql:') {
      throw new Error('DATABASE_URL must use PostgreSQL');
    }

    const adapter = new PrismaPg({
      connectionString,
      max: positiveInteger('DATABASE_POOL_MAX', 10),
      connectionTimeoutMillis: positiveInteger(
        'DATABASE_CONNECTION_TIMEOUT_MS',
        5000,
      ),
      idleTimeoutMillis: positiveInteger('DATABASE_IDLE_TIMEOUT_MS', 30000),
      statement_timeout: positiveInteger('DATABASE_STATEMENT_TIMEOUT_MS', 15000),
    });
    super({
      adapter,
      transactionOptions: {
        maxWait: positiveInteger('DATABASE_TRANSACTION_MAX_WAIT_MS', 5000),
        timeout: positiveInteger('DATABASE_TRANSACTION_TIMEOUT_MS', 20000),
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onApplicationShutdown() {
    await this.$disconnect();
  }
}
