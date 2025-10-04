import { nestApi } from './axiosConfig';

export const productService = {
  getProducts: async (page = 1, limit = 10) => {
    const response = await nestApi.get('/products', {
      params: { page, limit },
    });
    return response.data;
  },

  getProductById: async (id) => {
    const response = await nestApi.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await nestApi.post('/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await nestApi.patch(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    await nestApi.delete(`/products/${id}`);
  },
};