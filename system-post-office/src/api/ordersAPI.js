import { nestJSAPI } from "./axiosInstances";


export const ordersAPI = {
  // Get pickup orders
  getPickupOrders: async (postOfficeId, page = 1, limit = 10, fromDate = null, toDate = null) => {
    const params = {
      postOfficeId,
      page,
      limit,
    };

    if (fromDate) {
      params.fromDate = fromDate;
    }
    if (toDate) {
      params.toDate = toDate;
    }

    const response = await nestJSAPI.get('/orders/pickup', { params });
    return response.data;
  },

  // Get received orders
  getReceivedOrders: async (postOfficeId, page = 1, limit = 10, fromDate = null, toDate = null) => {
    const params = {
      postOfficeId,
      page,
      limit,
    };

    if (fromDate) {
      params.fromDate = fromDate;
    }
    if (toDate) {
      params.toDate = toDate;
    }

    const response = await nestJSAPI.get('/orders/received', { params });
    return response.data;
  },

  // Get failed orders
  getFailedOrders: async (postOfficeId, page = 1, limit = 10, fromDate = null, toDate = null) => {
    const params = {
      postOfficeId,
      page,
      limit,
    };

    if (fromDate) {
      params.fromDate = fromDate;
    }
    if (toDate) {
      params.toDate = toDate;
    }

    const response = await nestJSAPI.get('/orders/failed', { params });
    return response.data;
  },

  // Get classified orders
  getClassifiedOrders: async (postOfficeId, page = 1, limit = 10, fromDate = null, toDate = null) => {
    const params = {
      postOfficeId,
      page,
      limit,
    };

    if (fromDate) {
      params.fromDate = fromDate;
    }
    if (toDate) {
      params.toDate = toDate;
    }

    const response = await nestJSAPI.get('/orders/classified', { params });
    return response.data;
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
