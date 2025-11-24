import { nestJSAPI } from "./axiosInstances";

export const ordersAPI = {
  // Get orders by post office and status
  getOrdersByStatus: async (postOfficeId, status, page = 1, limit = 10) => {
    const params = {
      status,
      page,
      limit,
    };

    const response = await nestJSAPI.get(`/orders/post-office/${postOfficeId}`, { params });
    return response.data;
  },

  // Get pickup orders (PICKUP_REQUESTED status)
  getPickupOrders: async (postOfficeId, page = 1, limit = 10) => {
    return ordersAPI.getOrdersByStatus(postOfficeId, 'PICKUP_REQUESTED', page, limit);
  },

  // Get received orders (IN_WAREHOUSE status)
  getReceivedOrders: async (postOfficeId, page = 1, limit = 10) => {
    return ordersAPI.getOrdersByStatus(postOfficeId, 'IN_WAREHOUSE', page, limit);
  },

  // Get failed orders (TRANSITING status)
  getFailedOrders: async (postOfficeId, page = 1, limit = 10) => {
    return ordersAPI.getOrdersByStatus(postOfficeId, 'TRANSITING', page, limit);
  },

  // Get classified orders (CLASSIFIED status)
  getClassifiedOrders: async (postOfficeId, page = 1, limit = 10) => {
    return ordersAPI.getOrdersByStatus(postOfficeId, 'CLASSIFIED', page, limit);
  },

  // Get in-coming orders (IN_COMING status)
  getInComingOrders: async (postOfficeId, page = 1, limit = 10) => {
    return ordersAPI.getOrdersByStatus(postOfficeId, 'IN_COMING', page, limit);
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    const response = await nestJSAPI.get(`/orders/${orderId}`);
    return response.data;
  },

  // Get order by code
  getOrderByCode: async (code) => {
    const response = await nestJSAPI.get(`/orders/code/${code}`);
    return response.data;
  },

  // Update order
  updateOrder: async (orderId, data) => {
    const response = await nestJSAPI.patch(`/orders/${orderId}`, data);
    return response.data;
  },
};

export default ordersAPI;
