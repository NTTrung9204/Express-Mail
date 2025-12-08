import { djangoAPI } from "./axiosInstances";

const shippersAPI = {
  // Get all users and filter shippers
  getShippers: async (page = 1, limit = 50) => {
    try {
      // const response = await djangoAPI.get("/api/v1/users", {
      //   params: {
      //     page,
      //     limit,
      //   },
      // });

      // Mock response for shippers
      const response = {
        data: {
          count: 3,
          results: [
            { id: 1, username: "shipper1", role: "shipper", fullname: "Nguyen Van A", phone: "0123456789" },
            { id: 2, username: "shipper2", role: "shipper", fullname: "Tran Thi B", phone: "0987654321" },
            { id: 3, username: "shipper3", role: "shipper", fullname: "Le Van C", phone: "0112233445" },
            { id: 4, username: "shipper4", role: "shipper", fullname: "Pham Thi D", phone: "0223344556" },
            { id: 5, username: "shipper5", role: "shipper", fullname: "Hoang Van E", phone: "0334455667" },
          ],
        },
      };

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
