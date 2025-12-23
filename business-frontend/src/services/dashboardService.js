import api from './api';

export const dashboardService = {
  // Get B2B statistics
  getB2BStats: async () => {
    const response = await api.get('/dashboard/b2b-stats');
    return response.data;
  },

  // Get recent orders
  getRecentOrders: async (limit = 5) => {
    const response = await api.get('/dashboard/recent-orders', {
      params: { limit },
    });
    return response.data;
  },

  // Get recent inquiries
  getRecentInquiries: async (limit = 5) => {
    const response = await api.get('/dashboard/recent-inquiries', {
      params: { limit },
    });
    return response.data;
  },

  // Get pending quotes
  getPendingQuotes: async (limit = 5) => {
    const response = await api.get('/dashboard/pending-quotes', {
      params: { limit },
    });
    return response.data;
  },

  // Get upcoming follow-ups
  getUpcomingFollowups: async (limit = 5) => {
    const response = await api.get('/dashboard/upcoming-followups', {
      params: { limit },
    });
    return response.data;
  },
};

export default dashboardService;

