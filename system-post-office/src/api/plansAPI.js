import { nestJSAPI } from "./axiosInstances";

const plansAPI = {
  // Get all route plans for a post office
  getRoutePlans: async (postOfficeId, mode = "pickup", page = 1, limit = 10) => {
    try {
      const response = await nestJSAPI.get("/plan/route-plans", {
        params: {
          post_office_id: postOfficeId,
          mode,
          page,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching route plans:", error);
      throw error;
    }
  },

  // Get vehicle route details
  getVehicleRoute: async (vehicleRouteId) => {
    try {
      const response = await nestJSAPI.get(`/plan/vehicle-route/${vehicleRouteId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching vehicle route:", error);
      throw error;
    }
  },
};

export default plansAPI;
