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

  // Get order by ID
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  // Download invoice
  getOrderInvoice: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/invoice`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get order tracking
  getOrderTracking: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/tracking`);
    return response.data;
  },

  // Reorder items
  reorderOrder: async (orderId) => {
    const response = await api.post(`/orders/${orderId}/reorder`);
    return response.data;
  },
};

