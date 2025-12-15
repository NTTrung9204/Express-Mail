import axios from 'axios';
import { toast } from 'react-toastify';

let isLoggingOut = false;

export const nestAPI = axios.create({
  baseURL: import.meta.env.VITE_NESTJS_API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

const API_URL = import.meta.env.VITE_API_URL;

nestAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

nestAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Auth error from NestJS API:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        fullData: error.response?.data
      });

      if (!isLoggingOut) {
        isLoggingOut = true;

        try {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          localStorage.removeItem('permissions');
        } catch (clearError) {
          console.error('Error clearing localStorage:', clearError);
        }

        toast.error('Phiên đăng nhập hết hạn hoặc quyền bị thay đổi. Vui lòng đăng nhập lại!', {
          autoClose: 2000
        });

        setTimeout(() => {
          window.location.href = `${API_URL}/admin/login`;
        }, 2000);
      }
    }
    return Promise.reject(error);
  }
);

export default nestAPI;
