import baseAPI from './axiosConfig';

export const authService = {
  login: async (credentials) => {
    const response = await baseAPI.post('/auth/login', credentials);
    const { access, refresh } = response.data;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    return response.data;
  },

  logout: async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const accessToken = localStorage.getItem('accessToken');
    if (refreshToken) {
      await baseAPI.post('/auth/logout', {
        refresh: refreshToken,
        access: accessToken
      });
    }
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
},

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await baseAPI.post('/auth/refresh', {
      refresh: refreshToken,
    });
    const { access } = response.data;
    localStorage.setItem('accessToken', access);
    return access;
  }
};