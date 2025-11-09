// userService.js
import baseAPI from './axiosConfig';

export const userService = {
  getUsers: async (page = 1, page_size = 10, search = '') => {
    const params = {
      page,
      page_size
    }

    if (search) {
      params.search = search;
    }

    const response = await baseAPI.get('/users', { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await baseAPI.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await baseAPI.post('/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    try {
      const response = await baseAPI.put(`/users/${id}`, userData);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật người dùng thành công!',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra',
        errors: error.response?.data?.errors || {},
      };
    }
  },

  patchUser: async (id, userData) => {
    const response = await baseAPI.patch(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    await baseAPI.delete(`/users/${id}`);
  },
};
