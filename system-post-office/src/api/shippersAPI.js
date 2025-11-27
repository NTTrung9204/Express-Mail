import { djangoAPI } from "./axiosInstances";

const shippersAPI = {
  // Get all users and filter shippers
  getShippers: async (page = 1, limit = 50) => {
    try {
      const response = await djangoAPI.get("/api/v1/users", {
        params: {
          page,
          limit,
        },
      });

      // Filter only shippers
      const shippers = response.data.results.filter(
        (user) => user.role === "shipper"
      );
      
      return {
        success: true,
        data: shippers,
        count: response.data.count,
      };
    } catch (error) {
      console.error("Error fetching shippers:", error);
      throw error;
    }
  },
};

export default shippersAPI;
