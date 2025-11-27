import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ShippingCostInformationDto } from 'src/domain/shipping/dto/shipping-cost-information.dto';

@Injectable()
export class DjangoService {
  private readonly logger = new Logger(DjangoService.name);
  private readonly baseURL: string;
  private readonly redis: ReturnType<RedisService['getClient']>;
  private readonly loginPath = '/api/v1/auth/login';
  private readonly refreshPath = '/api/v1/auth/refresh';
  private loginPromise: Promise<string> | null = null;

  constructor(private readonly redisService: RedisService) {
    this.baseURL =
      process.env.DJANGO_BASE_URL ||
      process.env.DJANGO_BACKEND_URL ||
      'http://localhost:8000';

    // Đảm bảo baseURL có protocol
    if (!this.baseURL.startsWith('http')) {
      this.baseURL = `https://${this.baseURL}`;
    }

    this.logger.log(`DjangoService using backend URL: ${this.baseURL}`);
    this.redis = this.redisService.getClient();
  }

  private async fetchWithAuth(
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    // Không thêm auth cho login/refresh endpoints
    const isAuthEndpoint =
      url.includes('/auth/login') || url.includes('/auth/refresh');

    if (!isAuthEndpoint) {
      const token = await this.loginIfNeeded();
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Retry với token mới nếu 401
    if (response.status === 401 && !isAuthEndpoint) {
      this.logger.warn('Got 401, clearing token and retrying');
      await this.redis.del('django:auth');
      this.loginPromise = null;

      const newToken = await this.loginIfNeeded();
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${newToken}`,
      };

      return fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
    }

    return response;
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
    // Nếu đang login thì đợi
    if (this.loginPromise) {
      this.logger.debug('Login already in progress, waiting');
      return this.loginPromise;
    }

    // Check token trong cache
    const stored = await this.getStoredTokens();
    if (stored && stored.access && Date.now() < stored.expiresAt - 5000) {
      this.logger.debug('Using cached token');
      return stored.access;
    }

    // Check lại lần nữa sau khi await
    if (this.loginPromise) {
      this.logger.debug('Login started by another request, waiting');
      return this.loginPromise;
    }

    // Bắt đầu login
    this.logger.log('Token expired or missing, initiating login');

    this.loginPromise = this.performLogin(stored)
      .then((token) => {
        this.loginPromise = null;
        return token;
      })
      .catch((error) => {
        this.loginPromise = null;
        throw error;
      });

    return this.loginPromise;
  }

  private async performLogin(
    stored: { access: string; refresh: string; expiresAt: number } | null,
  ): Promise<string> {
    this.logger.debug('performLogin started');

    // Thử refresh token trước
    if (stored && stored.refresh) {
      try {
        this.logger.debug('Attempting to refresh token');

        const response = await fetch(`${this.baseURL}${this.refreshPath}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: stored.refresh }),
        });

        if (response.ok) {
          const data = await response.json();
          const { access, refresh, expires_in } = data;

          if (!access) {
            throw new Error('No access token in refresh response');
          }

          await this.saveTokens(
            access,
            refresh || stored.refresh,
            expires_in || 3600,
          );
          this.logger.log('Token refreshed successfully');
          return access;
        } else {
          this.logger.warn(`Refresh failed with status ${response.status}`);
        }
      } catch (err: any) {
        this.logger.warn(
          `Refresh failed: ${err?.message || err}, will login using credentials`,
        );
      }
    }

    // Login bằng username/password
    const username = process.env.DJANGO_USERNAME;
    const password = process.env.DJANGO_PASSWORD;

    if (!username || !password) {
      const error = new Error('DJANGO_USERNAME/DJANGO_PASSWORD not set in env');
      this.logger.error(error.message);
      throw error;
    }

    try {
      this.logger.debug('Attempting to login with credentials');

      const response = await fetch(`${this.baseURL}${this.loginPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Login failed with status ${response.status}: ${errorText}`,
        );
      }

      const data = await response.json();
      const { access, refresh, expires_in } = data;

      if (!access) {
        throw new Error('No access token in login response');
      }

      await this.saveTokens(access, refresh, expires_in || 3600);
      this.logger.log('Logged in successfully');
      return access;
    } catch (err: any) {
      this.logger.error(`Login failed: ${err?.message || err}`, err?.stack);
      throw new Error(`Login failed: ${err?.message || err}`);
    }
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
      // Fetch user info
      const userResponse = await this.fetchWithAuth(`/api/v1/users/${shopId}`);

      if (!userResponse.ok) {
        throw new Error(
          `Failed to fetch user info: HTTP ${userResponse.status}`,
        );
      }

      const userData = await userResponse.json();

      // Fetch shop profile info
      const profileResponse = await this.fetchWithAuth(
        `/api/v1/users/${shopId}/profile`,
      );

      if (!profileResponse.ok) {
        this.logger.warn(
          `Failed to fetch shop profile: HTTP ${profileResponse.status}`,
        );
        // If profile endpoint fails, return just user data
        const profile = {
          ...userData,
          profileId: null,
          address: null,
          phoneNumber: null,
          latitude: null,
          longitude: null,
          postOffice: null,
        };
        await this.redis.set(cacheKey, JSON.stringify(profile), 'EX', 3600);
        return profile;
      }

      const profileData = await profileResponse.json();

      // Merge user and profile data
      const profile = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        excludePermissions: userData.excludePermissions || [],
        profileId: profileData.id,
        address: profileData.address,
        phoneNumber: profileData.phoneNumber,
        latitude: profileData.latitude,
        longitude: profileData.longitude,
        postOffice: profileData.postOffice,
      };

      await this.redis.set(cacheKey, JSON.stringify(profile), 'EX', 3600);
      return profile;
    } catch (err: any) {
      this.logger.warn(
        `Failed to fetch shop profile ${shopId}: ${err?.message || ''}`,
      );
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
      this.logger.log(
        `Fetching shipping rates: ${lengthCm}x${widthCm}x${heightCm} cm, ${weightKg} kg`,
      );

      const response = await this.fetchWithAuth(
        '/api/v1/shipping-rates/calculate-fee',
        {
          method: 'POST',
          body: JSON.stringify({
            lengthCm,
            widthCm,
            heightCm,
            weightKg,
            postOffice,
            receiverLatitude,
            receiverLongitude,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return response.json();
    } catch (error) {
      this.logger.error('Failed to fetch shipping rates from Django:', error);
      throw error;
    }
  }

  async calculateVehicleRoutingProblem(
    vehicles: Array<{
      id: number;
      start: [string, string];
      end: [string, string];
      profile: string;
    }>,
    jobs: Array<{
      id: number;
      location: [string, string];
      amounts: [number, number];
    }>,
    mode: string,
  ): Promise<any> {
    try {
      this.logger.log(
        `Calculating VRP with ${vehicles.length} vehicles and ${jobs.length} jobs`,
      );

      const response = await this.fetchWithAuth(
        '/api/v1/routes/vehicle-routing-problem',
        {
          method: 'POST',
          body: JSON.stringify({
            vehicles,
            jobs,
            mode,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return response.json();
    } catch (error) {
      this.logger.error('Failed to calculate VRP from Django:', error);
      throw error;
    }
  }

  async getPostOfficeCoordinates(postOfficeId: number): Promise<{
    latitude: string;
    longitude: string;
  }> {
    const cacheKey = `post_office_coords_${postOfficeId}`;

    // Try to get from Redis cache first
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.debug(
          `Post office ${postOfficeId} coordinates found in cache`,
        );
        return JSON.parse(cached);
      }
    } catch (error) {
      this.logger.warn(`Failed to get from cache: ${error.message}`);
    }

    try {
      // Call Django API to get post office details
      const response = await this.fetchWithAuth(
        `/api/v1/post-offices/${postOfficeId}`,
        {
          method: 'GET',
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${errorText} - Failed to fetch post office`,
        );
      }

      const postOfficeData = await response.json();

      // Extract coordinates
      const coordinates = {
        latitude: postOfficeData.latitude || '',
        longitude: postOfficeData.longitude || '',
      };

      try {
        await this.redis.setex(cacheKey, 36000, JSON.stringify(coordinates));
        this.logger.debug(
          `Cached post office ${postOfficeId} coordinates for 10 hours`,
        );
      } catch (cacheError) {
        this.logger.warn(`Failed to cache coordinates: ${cacheError.message}`);
      }

      return coordinates;
    } catch (error) {
      this.logger.error(
        `Failed to get post office ${postOfficeId} coordinates:`,
        error,
      );
      throw error;
    }
  }

  async fetchAllPostOffices(): Promise<
    Array<{
      id: number;
      name: string;
      address: string;
      wardCommune: number;
      provinceCity: number;
      district: number;
      latitude: string;
      longitude: string;
    }>
  > {
    const cacheKey = 'all_post_offices';

    // Try to get from Redis cache first
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.debug('All post offices found in cache');
        return JSON.parse(cached);
      }
    } catch (error) {
      this.logger.warn(
        `Failed to get post offices from cache: ${error.message}`,
      );
    }

    try {
      // Call Django API to get all post offices
      const response = await this.fetchWithAuth(
        '/api/v1/post-offices?page_size=100',
        {
          method: 'GET',
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${errorText} - Failed to fetch post offices`,
        );
      }

      const data = await response.json();
      const postOffices = data.results || [];

      try {
        // Cache for 1 hour
        await this.redis.setex(cacheKey, 3600, JSON.stringify(postOffices));
        this.logger.debug(
          `Cached ${postOffices.length} post offices for 1 hour`,
        );
      } catch (cacheError) {
        this.logger.warn(`Failed to cache post offices: ${cacheError.message}`);
      }

      return postOffices;
    } catch (error) {
      this.logger.error('Failed to fetch all post offices:', error);
      throw error;
    }
  }
}
