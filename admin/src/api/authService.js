import { djangoApi } from './axiosConfig';

export const authService = {
  login: async (credentials) => {
    const response = await djangoApi.post('/auth/login/', credentials);
    const { access, refresh } = response.data;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    return response.data;
  },

  logout: async () => {
    try {
      await djangoApi.post('/auth/logout/');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await djangoApi.post('/auth/refresh/', {
      refresh: refreshToken,
    });
    const { access } = response.data;
    localStorage.setItem('accessToken', access);
    return access;
  },
};