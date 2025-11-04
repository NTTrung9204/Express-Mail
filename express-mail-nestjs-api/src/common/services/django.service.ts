import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { RedisService } from './redis.service';

const DJANGO_BASE = process.env.DJANGO_BACKEND_URL || 'localhost:8000';

@Injectable()
export class DjangoService {
  private readonly logger = new Logger(DjangoService.name);
  private readonly http: AxiosInstance;
  private readonly redis: ReturnType<RedisService['getClient']>;
  private readonly loginPath = '/api/v1/auth/login/';
  private readonly refreshPath = '/api/v1/auth/refresh/';

  constructor(private readonly redisService: RedisService) {
    this.http = axios.create({ baseURL: DJANGO_BASE, timeout: 5000 });
    this.redis = this.redisService.getClient();
  }

  private async saveTokens(
    access: string,
    refresh: string,
    expiresInSec = 3600,
  ) {
    const payload = {
      access,
      refresh,
      expiresAt: Date.now() + expiresInSec * 1000,
    };
    await this.redis.set('django:auth', JSON.stringify(payload));
  }

  private async getStoredTokens(): Promise<{
    access: string;
    refresh: string;
    expiresAt: number;
  } | null> {
    const raw = await this.redis.get('django:auth');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      this.logger.error('Failed to parse stored Django tokens:', e);
      return null;
    }
  }

  async loginIfNeeded(): Promise<string> {
    const stored = await this.getStoredTokens();
    if (stored && stored.access && Date.now() < stored.expiresAt - 5000) {
      return stored.access;
    }

    // try to refresh
    if (stored && stored.refresh) {
      try {
        const res = await this.http.post(this.refreshPath, {
          refresh: stored.refresh,
        });
        const { access, refresh, expires_in } = res.data;
        await this.saveTokens(
          access,
          refresh || stored.refresh,
          expires_in || 3600,
        );
        return access;
      } catch (err) {
        this.logger.warn('Refresh failed, will login using credentials', err);
      }
    }

    // login using env credentials
    const username = process.env.DJANGO_USERNAME;
    const password = process.env.DJANGO_PASSWORD;
    if (!username || !password) {
      throw new Error('DJANGO_USERNAME/DJANGO_PASSWORD not set in env');
    }
    const res = await this.http.post(this.loginPath, { username, password });
    const { access, refresh, expires_in } = res.data;
    await this.saveTokens(access, refresh, expires_in || 3600);
    return access;
  }

  async fetchShopProfile(shopId: string) {
    if (!shopId) return null;

    const cacheKey = `django:shop:${shopId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        this.logger.error('Failed to parse cached shop profile:', e);
      }
    }

    const token = await this.loginIfNeeded();
    try {
      const res = await this.http.get(`/api/v1/users/${shopId}/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profile = res.data;
      // cache 1 hour
      await this.redis.set(cacheKey, JSON.stringify(profile), 'EX', 3600);
      return profile;
    } catch (err: any) {
      // if unauthorized, try refresh+retry once
      if (err.response && err.response.status === 401) {
        const access = await this.loginIfNeeded();
        const retry = await this.http.get(`/api/v1/users/${shopId}/profile/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        const profile = retry.data;
        await this.redis.set(cacheKey, JSON.stringify(profile), 'EX', 3600);
        return profile;
      }
      this.logger.warn(
        `Failed to fetch shop profile ${shopId}: ${err?.message}`,
      );
      return null;
    }
  }
}
