import { djangoAPI } from './axiosConfig';

export const getShippersByPostOfficeId = async (
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
      `/api/v1/post-offices/${postOfficeId}/shippers`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching shippers for post office ${postOfficeId}:`, error);
    return null;
  }
};

export const createShipper = async (postOfficeId, shipperData) => {
  if (!postOfficeId) {
    console.error("Post Office ID is required.");
    return null;
  }

  try {
    const formData = new FormData();
    
    formData.append('user.username', shipperData.username);
    formData.append('user.email', shipperData.email);
    formData.append('user.firstName', shipperData.firstName);
    formData.append('user.lastName', shipperData.lastName);
    
    if (shipperData.phoneNumber) {
      formData.append('profile.phoneNumber', shipperData.phoneNumber);
    }
    if (shipperData.address) {
      formData.append('profile.address', shipperData.address);
    }
    if (shipperData.motorModel) {
      formData.append('profile.motorModel', shipperData.motorModel);
    }
    if (shipperData.licensePlateNumber) {
      formData.append('profile.licensePlateNumber', shipperData.licensePlateNumber);
    }
    if (shipperData.cardId) {
      formData.append('profile.cardId', shipperData.cardId);
    }
    if (shipperData.avatar) {
      formData.append('profile.avatar', shipperData.avatar);
    }

    const response = await djangoAPI.post(
      `/api/v1/post-offices/${postOfficeId}/shippers`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error creating shipper for post office ${postOfficeId}:`, error);
    throw error;
  }
};

export const updateShipper = async (postOfficeId, userId, shipperData) => {
  if (!postOfficeId || !userId) {
    console.error("Post Office ID and User ID are required.");
    return null;
  }

  try {
    const formData = new FormData();

    if (shipperData.username !== undefined) {
      formData.append('user.username', shipperData.username);
    }
    
    if (shipperData.password) {
      formData.append('user.password', shipperData.password);
    }

    if (shipperData.email !== undefined) {
      formData.append('user.email', shipperData.email);
    }
    if (shipperData.firstName !== undefined) {
      formData.append('user.firstName', shipperData.firstName);
    }
    if (shipperData.lastName !== undefined) {
      formData.append('user.lastName', shipperData.lastName);
    }

    if (shipperData.phoneNumber !== undefined) {
      formData.append('profile.phoneNumber', shipperData.phoneNumber);
    }
    if (shipperData.address !== undefined) {
      formData.append('profile.address', shipperData.address);
    }
    if (shipperData.motorModel !== undefined) {
      formData.append('profile.motorModel', shipperData.motorModel);
    }
    if (shipperData.licensePlateNumber !== undefined) {
      formData.append('profile.licensePlateNumber', shipperData.licensePlateNumber);
    }
    if (shipperData.cardId !== undefined) {
      formData.append('profile.cardId', shipperData.cardId);
    }
    
    if (shipperData.avatar) {
      formData.append('profile.avatar', shipperData.avatar);
    }

    if (shipperData.excludePermissions && Array.isArray(shipperData.excludePermissions)) {
      shipperData.excludePermissions.forEach(permissionId => {
        formData.append('excludePermissions', permissionId);
      });
    }

    const response = await djangoAPI.patch(
      `/api/v1/post-offices/${postOfficeId}/shippers/${userId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Error updating shipper ${userId} for post office ${postOfficeId}:`, error);
    throw error; 
  }
};

export default getShippersByPostOfficeId;