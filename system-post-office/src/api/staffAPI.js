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
      `/api/v1/post-offices/${postOfficeId}/post-office-staffs`,
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
        password: staffData.password,
        email: staffData.email,
        firstName: staffData.firstName,
        lastName: staffData.lastName,
      },
      profile: {}
    };

    const response = await djangoAPI.post(
      `/api/v1/post-offices/${postOfficeId}/add-staff`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error(`Error creating staff for post office ${postOfficeId}:`, error);
    throw error;
  }
};

export default getStaffsByPostOfficeId;