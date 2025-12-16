import api from './api';

export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  getSalesData: async (period = '30days') => {
    const response = await api.get(`/dashboard/sales?period=${period}`);
    return response.data;
  },

  getRecentOrders: async (limit = 5) => {
    const response = await api.get(`/dashboard/recent-orders?limit=${limit}`);
    return response.data;
  },
};

export default dashboardService;

