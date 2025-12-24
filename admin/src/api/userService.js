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

  changePassword: async (passwordData) => {
    try {
      const response = await baseAPI.post('/users/change-password', passwordData);
      return {
        success: true,
        data: response.data,
        message: 'Đổi mật khẩu thành công!',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Đổi mật khẩu thất bại',
        errors: error.response?.data?.errors || {},
      };
    }
  },

  patchUser: async (id, userData) => {
    const response = await baseAPI.patch(`/users/${id}`, userData);
    return response.data;
  },

  toggleUserStatus: async (id, isActive) => {
    try {
      const response = await baseAPI.put(`/users/${id}/status`, { isActive });
      return {
        success: true,
        data: response.data,
        message: isActive ? 'Kích hoạt tài khoản thành công!' : 'Vô hiệu hóa tài khoản thành công!',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể thay đổi trạng thái tài khoản',
        errors: error.response?.data?.errors || {},
      };
    }
  },

  deleteUser: async (id) => {
    await baseAPI.delete(`/users/${id}`);
  },

  /**
   * @param {Object} payload
   * @param {Object} payload.user      
   * @param {Object} payload.profile   
   * @returns {Promise<Object>}        
   */
  shopRegister: async (payload) => {
    try {
      const response = await baseAPI.post('/users/shop-register', payload);
      return {
        success: true,
        data: response.data,
        message: response.data?.message || 'Đăng ký shop thành công!',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng ký shop thất bại',
        errors: error.response?.data?.errors || {},
      };
    }
  },
};