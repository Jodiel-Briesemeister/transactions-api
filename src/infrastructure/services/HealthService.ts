import { Knex } from 'knex';
import Redis from 'ioredis';

export interface DependencyStatus {
  status: 'ok' | 'error';
  latency_ms: number | null;
}

export class HealthService {
  constructor(
    private db: Knex,
    private redis: Redis,
  ) {}

  async checkDatabase(): Promise<DependencyStatus> {
    const start = Date.now();
    try {
      await this.db.raw('SELECT 1');
      return { status: 'ok', latency_ms: Date.now() - start };
    } catch {
      return { status: 'error', latency_ms: null };
    }
  }

  async checkRedis(): Promise<DependencyStatus> {
    const start = Date.now();
    try {
      await this.redis.ping();
      return { status: 'ok', latency_ms: Date.now() - start };
    } catch {
      return { status: 'error', latency_ms: null };
    }
  }
}
