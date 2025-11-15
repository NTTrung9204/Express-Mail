import nestAPI from './axiosNestConfig';

export const orderService = {
  getOrders: async (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await nestAPI.get('/orders', { params });
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await nestAPI.get(`/orders/${id}`);
    return response.data;
  },

  getOrderByCode: async (code) => {
    const response = await nestAPI.get(`/orders/code/${code}`);
    return response.data;
  },

  getOrdersByShopId: async (shopId) => {
    const response = await nestAPI.get(`/orders/shop/${shopId}`);
    return response.data;
  },

  getOrdersByShipperId: async (shipperId, page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await nestAPI.get(`/orders/shipper/${shipperId}`, { params });
    return response.data;
  },

  getOrdersByOrderStatus: async (orderStatus) => {
    const response = await nestAPI.get(`/orders/status/order/${orderStatus}`);
    return response.data;
  },

  getOrdersByShippingStatus: async (shippingStatus) => {
    const response = await nestAPI.get(`/orders/status/shipping/${shippingStatus}`);
    return response.data;
  },

  createOrder: async (orderData) => {
    const response = await nestAPI.post('/orders', orderData);
    return response.data;
  },

  updateOrder: async (id, orderData) => {
    const response = await nestAPI.patch(`/orders/${id}`, orderData);
    return response.data;
  },

  deleteOrder: async (id) => {
    const response = await nestAPI.delete(`/orders/${id}`);
    return response.data;
  },
};
