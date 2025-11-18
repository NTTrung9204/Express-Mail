import axios from 'axios';

/**
 * Axios instance for NestJS backend
 */
export const nestJSAPI = axios.create({
  baseURL: import.meta.env.VITE_API_NESTJS_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Axios instance for Django backend
 */
export const djangoAPI = axios.create({
  baseURL: import.meta.env.VITE_API_DJANGO_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor for NestJS - add access token to headers
 */
nestJSAPI.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Request interceptor for Django - add access token to headers
 */
djangoAPI.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for NestJS - handle token refresh on 401
 */
nestJSAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          // No refresh token, redirect to login
          window.location.href = '/post-office/login';
          return Promise.reject(error);
        }

        // Call refresh endpoint (NestJS)
        const response = await axios.post(
          `${import.meta.env.VITE_API_NESTJS_BASE_URL || 'http://localhost:3000'}/api/v1/auth/refresh`,
          { refresh: refreshToken }
        );

        const { access } = response.data;

        // Save new access token
        localStorage.setItem('accessToken', access);

        // Update authorization header and retry original request
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return nestJSAPI(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/post-office/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Response interceptor for Django - handle token refresh on 401
 */
djangoAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          // No refresh token, redirect to login
          window.location.href = '/post-office/login';
          return Promise.reject(error);
        }

        // Call refresh endpoint (Django)
        const response = await axios.post(
          `${import.meta.env.VITE_API_DJANGO_BASE_URL || 'http://localhost:8000'}/api/v1/auth/refresh`,
          { refresh: refreshToken }
        );

        const { access } = response.data;

        // Save new access token
        localStorage.setItem('accessToken', access);

        // Update authorization header and retry original request
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return djangoAPI(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/post-office/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default nestJSAPI;
