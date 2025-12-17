import { djangoAPI } from './axiosInstances';

/**
 * API for Post Office operations
 */
export const postOfficeAPI = {
  /**
   * Get post office details by ID
   * @param {number} postOfficeId - The ID of the post office
   * @returns {Promise<Object>} Post office details
   */
  getPostOfficeDetails: async (postOfficeId) => {
    try {
      const response = await djangoAPI.get(`/api/v1/post-offices/${postOfficeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching post office ${postOfficeId}:`, error);
      return null;
    }
  },

  /**
   * Get multiple post offices details
   * @param {number[]} postOfficeIds - Array of post office IDs
   * @returns {Promise<Object>} Map of post office IDs to their details
   */
  getMultiplePostOffices: async (postOfficeIds) => {
    const postOfficeMap = {};
    
    // Fetch all post offices in parallel
    const promises = postOfficeIds.map(id =>
      postOfficeAPI.getPostOfficeDetails(id).then(data => {
        if (data) {
          postOfficeMap[id] = data;
        }
      })
    );

    await Promise.all(promises);
    return postOfficeMap;
  },
};
