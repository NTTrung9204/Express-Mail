import axios from 'axios';

// Django API instance
export const djangoApi = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// NestJS API instance
export const nestApi = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for both instances
const requestInterceptor = (config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Response interceptor for both instances
const responseInterceptor = (response) => response;

// Error interceptor for Django API
const djangoErrorInterceptor = async (error) => {
  const originalRequest = error.config;

  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await djangoApi.post('/auth/refresh/', {
        refresh: refreshToken,
      });

      const { access } = response.data;
      localStorage.setItem('accessToken', access);

      originalRequest.headers.Authorization = `Bearer ${access}`;
      return djangoApi(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }

  return Promise.reject(error);
};

// Error interceptor for NestJS API
const nestErrorInterceptor = async (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

// Apply interceptors to Django API
djangoApi.interceptors.request.use(requestInterceptor);
djangoApi.interceptors.response.use(responseInterceptor, djangoErrorInterceptor);

// Apply interceptors to NestJS API
nestApi.interceptors.request.use(requestInterceptor);
nestApi.interceptors.response.use(responseInterceptor, nestErrorInterceptor);