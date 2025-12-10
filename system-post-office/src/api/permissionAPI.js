import { djangoAPI } from './axiosConfig';

export const fetchRoleByName = async (roleName) => {
  try {
    const response = await djangoAPI.get('/api/v1/groups', {
      params: {
        name: roleName
      }
    });
    
    if (response.data && response.data.length > 0) {
      return response.data[0]; 
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching role by name ${roleName}:`, error);
    return null;
  }
};
export const fetchGroupPermissions = async (groupId) => {
  try {
    const response = await djangoAPI.get(`/api/v1/groups/${groupId}/permissions`);
    
    return response.data; 
  } catch (error) {
    console.error(`Error fetching permissions for group ${groupId}:`, error);
    return null;
  }
};

export const fetchPermissionsByRoleName = async (roleName) => {
  try {
    const role = await fetchRoleByName(roleName);
    
    if (!role || !role.id) {
      console.error(`Role ${roleName} not found`);
      return null;
    }
    
    const permissions = await fetchGroupPermissions(role.id);
    
    return permissions;
  } catch (error) {
    console.error(`Error fetching permissions for role ${roleName}:`, error);
    return null;
  }
};

export default {
  fetchRoleByName,
  fetchGroupPermissions,
  fetchPermissionsByRoleName
};