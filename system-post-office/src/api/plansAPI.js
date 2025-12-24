import { nestJSAPI } from "./axiosInstances";

const plansAPI = {
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

  getVehicleRoute: async (vehicleRouteId) => {
    try {
      const response = await nestJSAPI.get(`/plan/vehicle-route/${vehicleRouteId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching vehicle route:", error);
      throw error;
    }
  },

  assignVehicleRoutes: async (assignments) => {
    try {
      const response = await nestJSAPI.post("/plan/assign-vehicle-routes", {
        assignments,
      });
      return response.data;
    } catch (error) {
      console.error("Error assigning vehicle routes:", error);
      throw error;
    }
  },

  getShippingPlanSteps: async (shipperId, mode, startDate, endDate) => {
    try {
      const response = await nestJSAPI.get("/plan/shipping-plan", {
        params: {
          shipper_id: shipperId,
          mode,
          start_date: startDate,
          end_date: endDate,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching shipping plan steps:", error);
      throw error;
    }
  },
};

export default plansAPI;