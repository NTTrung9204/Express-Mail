import baseAPI from "./axiosConfig";

export const permissionService = {
  getUserPermissions: async (userId) => {
    const response = await baseAPI.get(`/users/${userId}/profile`);
    return response.data;
  },

  getGroups: async () => {
    const response = await baseAPI.get("/groups");
    return response.data;
  },

  getGroupById: async (groupId) => {
    const response = await baseAPI.get(`/groups/${groupId}`);
    return response.data;
  },

  getGroupPermissions: async (groupId) => {
    const response = await baseAPI.get(`/groups/${groupId}/permissions`);
    return response.data;
  },

  updateAdminPermissions: async (data) => {
    const response = await baseAPI.post("/profiles/admin-profile", data);
    return response.data;
  },

  updatePostOfficeManagerPermissions: async (data) => {
    const response = await baseAPI.post("/profiles/post-office-manager-profile", data);
    return response.data;
  },

  updatePostOfficeStaffPermissions: async (data) => {
    const response = await baseAPI.post("/profiles/post-office-staff-profile", data);
    return response.data;
  },

  updateShipperPermissions: async (data) => {
    const response = await baseAPI.post("/profiles/shipper-profile", data);
    return response.data;
  },

  updateShopPermissions: async (data) => {
    const response = await baseAPI.post("/profiles/shop-profile", data);
    return response.data;
  },

  getUserProfile: async (userId) => {
    const response = await baseAPI.get(`/users/${userId}/profile`);
    return response.data;
  },

};
