import { djangoAPI } from './axiosConfig';

export const getStaffsByPostOfficeId = async (
  postOfficeId,
  page = 1,
  page_size = 20
) => {
  if (!postOfficeId) {
    console.error("Post Office ID is required.");
    return null;
  }

  const params = { page, page_size };

  try {
    const response = await djangoAPI.get(
      `/api/v1/post-offices/${postOfficeId}/staffs`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching staffs for post office ${postOfficeId}:`, error);
    return null;
  }
};

export const createStaff = async (postOfficeId, staffData) => {
  if (!postOfficeId) {
    console.error("Post Office ID is required.");
    return null;
  }

  try {
    const payload = {
      user: {
        username: staffData.username,
        email: staffData.email,
        firstName: staffData.firstName,
        lastName: staffData.lastName,
      },
      profile: {},
      excludePermissions: staffData.excludePermissions || []
    };

    const response = await djangoAPI.post(
      `/api/v1/post-offices/${postOfficeId}/staffs`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error(`Error creating staff for post office ${postOfficeId}:`, error);
    throw error;
  }
};

export const updateStaff = async (postOfficeId, userId, staffData) => {
  if (!postOfficeId || !userId) {
    console.error("Post Office ID and User ID are required.");
    return null;
  }

  try {
    const formData = new FormData();

    if (staffData.username !== undefined) {
      formData.append('user.username', staffData.username);
    }
    
    if (staffData.password) {
      formData.append('user.password', staffData.password);
    }

    if (staffData.email !== undefined) {
      formData.append('user.email', staffData.email);
    }
    if (staffData.firstName !== undefined) {
      formData.append('user.firstName', staffData.firstName);
    }
    if (staffData.lastName !== undefined) {
      formData.append('user.lastName', staffData.lastName);
    }

    if (staffData.profile) {
      if (staffData.profile.id !== undefined) {
        formData.append('profile.id', staffData.profile.id);
      }
      if (staffData.profile.user !== undefined) {
        formData.append('profile.user', staffData.profile.user);
      }
      if (staffData.profile.postOffice !== undefined) {
        formData.append('profile.postOffice', staffData.profile.postOffice);
      }
    }

    if (staffData.excludePermissions && Array.isArray(staffData.excludePermissions)) {
      staffData.excludePermissions.forEach(permissionId => {
        formData.append('excludePermissions', permissionId);
      });
    }

    const response = await djangoAPI.patch(
      `/api/v1/post-offices/${postOfficeId}/staffs/${userId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Error updating staff ${userId} for post office ${postOfficeId}:`, error);
    throw error; 
  }
};

export default getStaffsByPostOfficeId;