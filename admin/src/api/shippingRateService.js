import baseAPI from './axiosConfig';

export const shippingRateService = {
  getShippingRates: async (page = 1, page_size = 10) => {
    const response = await baseAPI.get('/shipping-rates', {
      params: { page, page_size }
    });
    return response.data;
  },

  getShippingRateById: async (id) => {
    const response = await baseAPI.get(`/shipping-rates/${id}`);
    return response.data;
  },

  createShippingRate: async (data) => {
    const response = await baseAPI.post('/shipping-rates', data);
    return response.data;
  },

  updateShippingRateActive: async (id, isActive) => {
    const response = await baseAPI.patch(`/shipping-rates/${id}/active`, { isActive });
    return response.data;
  },

  getShippingRateActive: async (id) => {
    const response = await baseAPI.get(`/shipping-rates/${id}/active`);
    return response.data;
  },
};
