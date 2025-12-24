import baseAPI from './axiosConfig';
import { extractPermissionsFromToken } from '../utils/tokenUtil';

export const authService = {
  login: async (credentials) => {
    const response = await baseAPI.post('/auth/login', credentials);
    const { access, user } = response.data; 
    localStorage.setItem('accessToken', access);
    localStorage.setItem('user', JSON.stringify(user));
    const permissions = extractPermissionsFromToken(access);
    localStorage.setItem('permissions', JSON.stringify(permissions));
    return response.data;
  },

  logout: async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        await baseAPI.post('/auth/logout', { access: accessToken });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('permissions');
    }
  }
};
