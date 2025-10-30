import baseAPI from "./axiosConfig";

export const permissionService = {
  /** 
   * Lấy quyền của người dùng cụ thể (profile)
   * GET /users/{userId}/profile/
   */
  getUserPermissions: async (userId) => {
    const response = await baseAPI.get(`/users/${userId}/profile/`);
    return response.data;
  },

  /** 
   * Lấy tất cả nhóm quyền theo loại người dùng 
   * GET /groups/
   */
  getGroups: async () => {
    const response = await baseAPI.get("/groups/");
    return response.data;
  },

  /** 
   * Lấy thông tin chi tiết của 1 nhóm quyền 
   * GET /groups/{id}
   */
  getGroupById: async (groupId) => {
    const response = await baseAPI.get(`/groups/${groupId}/`);
    return response.data;
  },

  /** 
   * Lấy danh sách quyền thuộc về 1 nhóm quyền cụ thể 
   * GET /groups/{id}/permissions
   */
  getGroupPermissions: async (groupId) => {
    const response = await baseAPI.get(`/groups/${groupId}/permissions/`);
    return response.data;
  },

  /** 
   * Cập nhật loại trừ permissions cho Admin 
   * Body: { user, excludePermissions }
   */
  updateAdminPermissions: async (data) => {
    const response = await baseAPI.post("/profiles/admin-profile/", data);
    return response.data;
  },

  /** 
   * Cập nhật loại trừ permissions cho Trưởng bưu cục 
   * Body: { user, postOffice, excludePermissions }
   */
  updatePostOfficeManagerPermissions: async (data) => {
    const response = await baseAPI.post("/profiles/post-office-manager-profile/", data);
    return response.data;
  },

  /** 
   * Cập nhật loại trừ permissions cho Nhân viên bưu cục 
   * Body: { user, postOffice, excludePermissions }
   */
  updatePostOfficeStaffPermissions: async (data) => {
    const response = await baseAPI.post("/profiles/post-office-staff-profile/", data);
    return response.data;
  },

  /** 
   * Cập nhật loại trừ permissions cho Shipper 
   * Body: { user, postOffice, excludePermissions }
   */
  updateShipperPermissions: async (data) => {
    const response = await baseAPI.post("/profiles/shipper-profile/", data);
    return response.data;
  },

  /** 
   * Cập nhật loại trừ permissions cho Shop 
   * Body: { user, excludePermissions }
   */
  updateShopPermissions: async (data) => {
    const response = await baseAPI.post("/profiles/shop-profile/", data);
    return response.data;
  },

  getUserProfile: async (userId) => {
    const response = await baseAPI.get(`/users/${userId}/profile/`);
    return response.data;
  },

};
