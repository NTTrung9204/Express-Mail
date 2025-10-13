// userService.js
import baseAPI from './axiosConfig';

export const userService = {
  getUsers: async (page = 1, page_size = 10) => {
    const response = await baseAPI.get('/users/', {
      params: { page, page_size },
    });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await baseAPI.get(`/users/${id}/`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await baseAPI.post('/users/', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await baseAPI.put(`/users/${id}/`, userData);
    return response.data;
  },

  patchUser: async (id, userData) => {
    const response = await baseAPI.patch(`/users/${id}/`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    await baseAPI.delete(`/users/${id}/`);
  },
};
