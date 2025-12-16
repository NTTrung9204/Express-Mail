import axios from 'axios';

export const djangoAPI = axios.create({
  baseURL: import.meta.env.VITE_DJANGO_API_URL + '/api/v1',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

djangoAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isLoggingOut = false;

djangoAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Django API Auth Error:', error.response?.status, error.response?.data);

      if (!isLoggingOut) {
        isLoggingOut = true;

        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.removeItem('permissions');

        setTimeout(() => {
          window.location.href = `${import.meta.env.VITE_API_URL || ''}/admin/login`;
        }, 1000);
      }
    }
    return Promise.reject(error);
  }
);

export default djangoAPI;