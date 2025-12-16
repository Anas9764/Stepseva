import api from './api';

export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getUserOrders: async (userId) => {
    const response = await api.get(`/orders/${userId}`);
    return response.data;
  },

  getAllOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
};

