import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { RedisService } from './redis.service';
import { ShippingCostInformationDto } from 'src/domain/shipping/dto/shipping-cost-information.dto';

@Injectable()
export class DjangoService {
  private readonly logger = new Logger(DjangoService.name);
  private readonly http: AxiosInstance;
  private readonly redis: ReturnType<RedisService['getClient']>;
  private readonly loginPath = '/api/v1/auth/login';
  private readonly refreshPath = '/api/v1/auth/refresh';

  constructor(private readonly redisService: RedisService) {
    const DJANGO_BASE = process.env.DJANGO_BACKEND_URL || 'localhost:8000';
    this.http = axios.create({ baseURL: DJANGO_BASE, timeout: 5000 });
    this.redis = this.redisService.getClient();
    this.setupInterceptors();

    this.logger.log(`DjangoService using backend URL: ${DJANGO_BASE}`);
  }

  private setupInterceptors() {
    this.http.interceptors.request.use(
      async (config) => {
        try {
          const url = config.url || '';
          if (url.endsWith(this.loginPath) || url.endsWith(this.refreshPath)) {
            return config;
          }

          const token = await this.loginIfNeeded();
          config.headers = config.headers || {};
          const hasAuthHeader = Boolean(
            config.headers['Authorization'] || config.headers['authorization'],
          );
          if (!hasAuthHeader) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }
        } catch (e) {
          this.logger.warn('Failed to attach Django token to request', e);
        }
        return config;
      },
      (err) => Promise.reject(err as Error),
    );

    this.http.interceptors.response.use(
      (res) => res,
      async (error) => {
        const originalConfig: any = error.config;
        if (!originalConfig) {
          return Promise.reject(error as Error);
        }

        if (
          error.response &&
          error.response.status === 401 &&
          !originalConfig._djangoRetry
        ) {
          originalConfig._djangoRetry = true;
          try {
            const token = await this.loginIfNeeded();
            originalConfig.headers = originalConfig.headers || {};
            originalConfig.headers['Authorization'] = `Bearer ${token}`;
            return this.http.request(originalConfig);
          } catch (e) {
            // fall through to reject
            this.logger.warn('Retry after 401 failed', e);
            return Promise.reject(e as Error);
          }
        }

        return Promise.reject(error as Error);
      },
    );
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

    try {
      const res = await this.http.get(`/api/v1/users/${shopId}/profile`);
      const profile = res.data;
      // cache 1 hour
      await this.redis.set(cacheKey, JSON.stringify(profile), 'EX', 3600);
      return profile;
    } catch (err: any) {
      const warnMsg =
        'Failed to fetch shop profile ' + shopId + ': ' + (err?.message || '');
      this.logger.warn(warnMsg);
      return null;
    }
  }

  async fetchShippingRates(
    lengthCm: number,
    widthCm: number,
    heightCm: number,
    weightKg: number,
    postOffice: string,
    receiverLatitude: string,
    receiverLongitude: string,
  ): Promise<ShippingCostInformationDto> {
    try {
      console.log(
        `Fetching shipping rates from Django for dimensions: ${lengthCm}x${widthCm}x${heightCm} cm, weight: ${weightKg} g, post office: ${postOffice}, receiver coords: ${receiverLatitude}, ${receiverLongitude}`,
      );
      const res = await this.http.post('/api/v1/shipping-rates/calculate-fee', {
        lengthCm,
        widthCm,
        heightCm,
        weightKg,
        postOffice,
        receiverLatitude,
        receiverLongitude: receiverLongitude,
      });
      console.log(
        `Received shipping cost information: ${JSON.stringify(res.data)}`,
      );
      return res.data;
    } catch (error) {
      this.logger.error('Failed to fetch shipping rates from Django:', error);
      throw error;
    }
  }
}
