import baseAPI from './axiosConfig';

export const permissionService = {
  getPermissions: async (page = 1, limit = 10) => {
    const response = await baseAPI.get('/admin/permissions/', {
      params: { page, limit }
    });
    return response.data;
  },

  createPermission: async (data) => {
    const response = await baseAPI.post('/admin/permissions/', data);
    return response.data;
  },

  updatePermission: async (id, data) => {
    const response = await baseAPI.put(`/admin/permissions/${id}/`, data);
    return response.data;
  },

  deletePermission: async (id) => {
    await baseAPI.delete(`/admin/permissions/${id}/`);
  },

  // Group related endpoints
  getGroups: async (page = 1, limit = 10) => {
    const response = await baseAPI.get('/admin/groups/', {
      params: { page, limit }
    });
    return response.data;
  },

  createGroup: async (data) => {
    const response = await baseAPI.post('/admin/groups/', data);
    return response.data;
  },

  updateGroup: async (id, data) => {
    const response = await baseAPI.put(`/admin/groups/${id}/`, data);
    return response.data;
  },

  deleteGroup: async (id) => {
    await baseAPI.delete(`/admin/groups/${id}/`);
  }
};