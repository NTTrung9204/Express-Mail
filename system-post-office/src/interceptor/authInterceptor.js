import baseAPI from '../api/axiosConfig';
import authAPI from '../api/authAPI';
import { toast } from 'react-toastify';

let isLoggingOut = false;
export const setupAuthInterceptor = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  
  baseAPI.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      const isLoginRequest = originalRequest.url?.includes('/auth/login') || 
                            originalRequest.url?.includes('/api/v1/auth/login');
      
      if (isLoginRequest) {
        return Promise.reject(error);
      }
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.detail || 
                           '';
        
        if (
          errorMessage.includes('Chưa xác thực') ||
          errorMessage.includes('authentication') ||
          errorMessage.includes('Unauthorized') ||
          (error.response?.status === 401 && !originalRequest._retry)
        ) {
          if (!isLoggingOut) {
            isLoggingOut = true;
            
            toast.error('Quyền bị thay đổi. Vui lòng đăng nhập lại!', {
              autoClose: 3000,
              onClose: async () => {
                await authAPI.logout();
                window.location.href = `${API_URL}/admin/login`;
                isLoggingOut = false;
              }
            });
            
            originalRequest._retry = true;
          }
          
          return Promise.reject(error);
        }
      }
      
      return Promise.reject(error);
    }
  );
};
