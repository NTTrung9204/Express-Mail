import axios from 'axios';

export const baseAPI = axios.create({
  baseURL: import.meta.env.VITE_DJANGO_API_URL + '/api/v1',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

baseAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

baseAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      console.warn('Access token hết hạn hoặc không hợp lệ — đã xoá khỏi localStorage.');
    }
    return Promise.reject(error);
  }
);

export default baseAPI;
