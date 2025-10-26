import baseAPI from './axiosConfig';

export const orderService = {
  getOrders: async (page = 1, limit = 10, filters = {}) => {
    const response = await baseAPI.get('/admin/orders/', {
      params: {
        page,
        limit,
        ...filters,
      },
    });
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await baseAPI.get(`/admin/orders/${id}/`);
    return response.data;
  },

  createOrder: async (data) => {
    const response = await baseAPI.post('/admin/orders/', data);
    return response.data;
  },

  updateOrder: async (id, data) => {
    const response = await baseAPI.put(`/admin/orders/${id}/`, data);
    return response.data;
  },

  deleteOrder: async (id) => {
    await baseAPI.delete(`/admin/orders/${id}/`);
  },

  // Order status management
  updateOrderStatus: async (id, status) => {
    const response = await baseAPI.patch(`/admin/orders/${id}/status/`, {
      status: status,
    });
    return response.data;
  },

  // Order tracking
  getOrderTracking: async (id) => {
    const response = await baseAPI.get(`/admin/orders/${id}/tracking/`);
    return response.data;
  },

  addTrackingEvent: async (orderId, data) => {
    const response = await baseAPI.post(`/admin/orders/${orderId}/tracking/`, data);
    return response.data;
  },
};