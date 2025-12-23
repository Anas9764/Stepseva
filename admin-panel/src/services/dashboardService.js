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

  getRecentLeads: async (limit = 5) => {
    const response = await api.get(`/dashboard/recent-leads?limit=${limit}`);
    return response.data;
  },

  getUpcomingFollowups: async (limit = 5) => {
    const response = await api.get(`/dashboard/upcoming-followups?limit=${limit}`);
    return response.data;
  },

  getRecentActivities: async (limit = 10) => {
    const response = await api.get(`/dashboard/recent-activities?limit=${limit}`);
    return response.data;
  },
};

export default dashboardService;

