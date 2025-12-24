import { djangoAPI } from './axiosConfig';
export const fetchUserPostOfficeId = async (userId) => {
  try {
    const response = await djangoAPI.get(`/api/v1/users/${userId}/profile`);
    
    const { postOffice } = response.data;

    return postOffice;
  } catch (error) {
    console.error(`Error fetching post office ID for user ${userId}:`, error);
    return null; 
  }
};

export default fetchUserPostOfficeId;