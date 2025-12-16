import { djangoAPI } from './axiosConfig';

export const userService = {
    changePassword: async (passwordData) => {
        try {
          const response = await djangoAPI.post('/api/v1/users/change-password', passwordData);
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
}