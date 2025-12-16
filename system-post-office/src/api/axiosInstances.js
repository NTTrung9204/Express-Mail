import axios from 'axios';
import { toast } from 'react-toastify';

export const nestJSAPI = axios.create({
  baseURL: import.meta.env.VITE_API_NESTJS_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const djangoAPI = axios.create({
  baseURL: import.meta.env.VITE_API_DJANGO_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isLoggingOut = false;
const API_URL = import.meta.env.VITE_API_URL;

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

const handleAuthError = async () => {
  if (!isLoggingOut) {
    isLoggingOut = true;
    
    toast.error('Quyền bị thay đổi. Vui lòng đăng nhập lại!', {
      autoClose: 3000,
      onClose: () => {
        // Clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('permissions');
        
        window.location.href = `${API_URL}/admin/login`;
        isLoggingOut = false;
      }
    });
  }
};

nestJSAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 || error.response?.status === 403) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.detail || 
                         '';
            if (
        errorMessage.includes('Chưa xác thực') ||
        errorMessage.includes('authentication') ||
        errorMessage.includes('Unauthorized') ||
        errorMessage.includes('Forbidden') ||
        (error.response?.status === 401 && !originalRequest._retry)
      ) {
        if (!originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
              await handleAuthError();
              return Promise.reject(error);
            }

            const response = await axios.post(
              `${import.meta.env.VITE_API_NESTJS_BASE_URL || 'http://localhost:3000'}/api/v1/auth/refresh`,
              { refresh: refreshToken }
            );

            const { access } = response.data;

            localStorage.setItem('accessToken', access);

            originalRequest.headers.Authorization = `Bearer ${access}`;
            return nestJSAPI(originalRequest);
          } catch (refreshError) {
            await handleAuthError();
            return Promise.reject(refreshError);
          }
        } else {
          await handleAuthError();
          return Promise.reject(error);
        }
      }
    }

    return Promise.reject(error);
  }
);


djangoAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 || error.response?.status === 403) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.detail || 
                         '';
      
      if (
        errorMessage.includes('Chưa xác thực') ||
        errorMessage.includes('authentication') ||
        errorMessage.includes('Unauthorized') ||
        errorMessage.includes('Forbidden') ||
        (error.response?.status === 401 && !originalRequest._retry)
      ) {
        if (!originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
              await handleAuthError();
              return Promise.reject(error);
            }

            const response = await axios.post(
              `${import.meta.env.VITE_API_DJANGO_BASE_URL || 'http://localhost:8000'}/api/v1/auth/refresh`,
              { refresh: refreshToken }
            );

            const { access } = response.data;

            localStorage.setItem('accessToken', access);

            originalRequest.headers.Authorization = `Bearer ${access}`;
            return djangoAPI(originalRequest);
          } catch (refreshError) {
            await handleAuthError();
            return Promise.reject(refreshError);
          }
        } else {
          await handleAuthError();
          return Promise.reject(error);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default nestJSAPI;