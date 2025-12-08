import { djangoAPI } from './axiosConfig';

export const togglePostOfficeUserStatus = async (postOfficeId, userId, isActive) => {
  try {
    await djangoAPI.put(`/api/v1/post-offices/${postOfficeId}/user-status`, {
      user: userId,
      isActive,
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể thay đổi trạng thái tài khoản',
    };
  }
};