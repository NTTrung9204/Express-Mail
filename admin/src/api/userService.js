import { djangoApi } from './axiosConfig';

export const userService = {
  getUsers: async (page = 1, limit = 10) => {
    const response = await djangoApi.get('/admin/users/', {
      params: { page, limit },
    });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await djangoApi.get(`/admin/users/${id}/`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await djangoApi.post('/admin/users/', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await djangoApi.put(`/admin/users/${id}/`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    await djangoApi.delete(`/admin/users/${id}/`);
  },
};