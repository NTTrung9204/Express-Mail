import { djangoAPI } from "./axiosInstances";

const shippersAPI = {
  // Get shippers for a specific post office
  getShippers: async (postOfficeId, page = 1, limit = 50) => {
    try {
      const response = await djangoAPI.get(
        `/api/v1/post-offices/${postOfficeId}/shippers`,
        {
          params: {
            page,
            limit,
          },
        }
      );

      return {
        success: true,
        data: response.data.results || [],
        count: response.data.count,
        hasNext: response.data.hasNext,
        numPages: response.data.numPages,
      };
    } catch (error) {
      console.error("Error fetching shippers:", error);
      return {
        success: false,
        data: [],
        count: 0,
        message: error.response?.data?.message || "Lỗi khi lấy danh sách shipper",
      };
    }
  },
};

export default shippersAPI;
