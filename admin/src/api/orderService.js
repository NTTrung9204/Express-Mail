import { nestApi } from './axiosConfig';

export const orderService = {
  getOrders: async (page = 1, limit = 10) => {
    const response = await nestApi.get('/orders', {
      params: { page, limit },
    });
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await nestApi.get(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (orderData) => {
    const response = await nestApi.post('/orders', orderData);
    return response.data;
  },

  updateOrder: async (id, orderData) => {
    const response = await nestApi.patch(`/orders/${id}`, orderData);
    return response.data;
  },

  deleteOrder: async (id) => {
    await nestApi.delete(`/orders/${id}`);
  },
};