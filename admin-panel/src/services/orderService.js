import api from './api';

export const orderService = {
  getAllOrders: async (params) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id, data) => {
    const response = await api.put(`/orders/${id}`, data);
    return response.data;
  },

  deleteOrder: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
};

export default orderService;

