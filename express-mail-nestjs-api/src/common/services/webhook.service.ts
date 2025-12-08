import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class WebhookService {
  constructor(private readonly redisService: RedisService) {}
  async addToPermissionBlacklist(
    userId: number,
    timestamp: number,
    ttl: number,
  ): Promise<void> {
    const redisKey = this.getBlacklistKey(userId);
    await this.redisService.set(redisKey, timestamp.toString(), ttl);
  }

  async getBlacklistTimestamp(userId: number): Promise<number | null> {
    const redisKey = this.getBlacklistKey(userId);
    const timestamp = await this.redisService.get(redisKey);
    return timestamp ? parseInt(timestamp, 10) : null;
  }

  async isTokenValid(userId: number, tokenIssuedAt: number): Promise<boolean> {
    const permissionChangeTime = await this.getBlacklistTimestamp(userId);

    if (permissionChangeTime === null) {
      return true;
    }

    if (tokenIssuedAt > permissionChangeTime) {
      return true;
    }

    return false;
  }

  private getBlacklistKey(userId: number): string {
    return `permission:blacklist:${userId}`;
  }
}
