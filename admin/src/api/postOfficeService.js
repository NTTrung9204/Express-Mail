import baseAPI from './axiosConfig';

export const postOfficeService = {
  getPostOffices: async (page = 1, limit = 20) => {
    const response = await baseAPI.get('/post-offices/', {
      params: { page, limit }
    });
    return response.data;
  },

  getPostOfficeById: async (id) => {
    const response = await baseAPI.get(`/post-offices/${id}/`);
    return response.data;
  },

  createPostOffice: async (data) => {
    const response = await baseAPI.post('/post-offices/', data);
    return response.data;
  },

  updatePostOffice: async (id, data) => {
    const response = await baseAPI.put(`/post-offices/${id}/`, data);
    return response.data;
  },

  deletePostOffice: async (id) => {
    await baseAPI.delete(`/post-offices/${id}/`);
  },

  // Additional endpoints for managing staff
  addStaffToOffice: async (officeId, userId) => {
    const response = await baseAPI.post(`/post-offices/${officeId}/staff/`, {
      user_id: userId
    });
    return response.data;
  },

  removeStaffFromOffice: async (officeId, userId) => {
    await baseAPI.delete(`/post-offices/${officeId}/staff/${userId}/`);
  },

  getOfficeStaff: async (officeId, page = 1, limit = 10) => {
    const response = await baseAPI.get(`/post-offices/${officeId}/staff/`, {
      params: { page, limit }
    });
    return response.data;
  }
};