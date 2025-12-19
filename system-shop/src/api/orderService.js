import nestAPI from './axiosNestConfig';

export const orderService = {
  getOrders: async (shopId, page = 1, limit = 10, filters = {}) => {
    const params = {
      page,
      limit,
      shopId,       
      ...filters   
    };

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

  getOrdersByShopId: async (shopId, page = 1, limit = 5, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await nestAPI.get(`/orders/shop/${shopId}`, { params });
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
    const formData = new FormData();

    formData.append('receiver_name', orderData.receiver_name);
    formData.append('receiver_phone', orderData.receiver_phone);
    formData.append('receiver_province_city', orderData.receiver_province_city);
    formData.append('receiver_ward_commune', orderData.receiver_ward_commune);
    formData.append('receiver_address', orderData.receiver_address);
    formData.append('receiver_coordinate', orderData.receiver_coordinate);
    formData.append('receiver_district', orderData.receiver_district);

    formData.append('length', Number(orderData.length));
    formData.append('width', Number(orderData.width));
    formData.append('height', Number(orderData.height));
    formData.append('weight', Number(orderData.weight));
    formData.append('cod', Number(orderData.cod));

    formData.append('is_receiver_pay_shipping', Boolean(orderData.is_receiver_pay_shipping));
    
    if (orderData.order_status) {
      formData.append('order_status', orderData.order_status);
    }

    const productsPayload = orderData.products.map((p) => ({
      name: p.name,
      quantity: Number(p.quantity),
      weight: Number(p.weight),
    }));
    formData.append('products', JSON.stringify(productsPayload));

    orderData.products.forEach((product) => {
      if (product.img_url && product.img_url instanceof File) {
        formData.append('product_images', product.img_url);
      }
    });

    const response = await nestAPI.post('/orders', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

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