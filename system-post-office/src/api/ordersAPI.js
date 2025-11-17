import API from './axiosConfig';

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

    const response = await API.get('/orders/pickup', { params });
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

    const response = await API.get('/orders/received', { params });
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

    const response = await API.get('/orders/failed', { params });
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

    const response = await API.get('/orders/classified', { params });
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    const response = await API.get(`/orders/${orderId}`);
    return response.data;
  },

  // Update order
  updateOrder: async (orderId, data) => {
    const response = await API.patch(`/orders/${orderId}`, data);
    return response.data;
  },
};

export default ordersAPI;
