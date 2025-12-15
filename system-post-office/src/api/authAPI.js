import API from './axiosConfig';

export const authAPI = {
  login: async (username, password) => {
    const response = await API.post('/api/v1/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  logout: async () => {
    try {
      await API.post('/api/v1/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('permissions');
    }
  },

  refresh: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await API.post('/api/v1/auth/refresh', {
      refresh: refreshToken,
    });
    return response.data;
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getAccessToken: () => {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken: () => {
    return localStorage.getItem('refreshToken');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },
};

export default authAPI;
