import djangoAPI from './axiosConfig';

export const authService = {
  login: async (credentials) => {
    const response = await djangoAPI.post('/auth/login', credentials);
    const { access } = response.data;
    localStorage.setItem('accessToken', access);
    return response.data;
  },

  logout: async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        await djangoAPI.post('/auth/logout', { access: accessToken });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  },
};
