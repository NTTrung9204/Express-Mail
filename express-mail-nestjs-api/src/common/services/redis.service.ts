import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor() {
    this.client = new Redis(REDIS_URL);
    this.client.on('error', (err) => this.logger.error('Redis error', err));
  }

  getClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(
    key: string,
    value: string,
    exSeconds?: number,
  ): Promise<'OK' | null> {
    if (exSeconds) return await this.client.set(key, value, 'EX', exSeconds);
    return await this.client.set(key, value);
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async onModuleDestroy() {
    try {
      await this.client.quit();
    } catch (e) {
      this.logger.warn('Error quitting Redis client', e);
    }
  }
}
