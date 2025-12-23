import api from './api';

export const analyticsService = {
  // Get order analytics
  getOrderAnalytics: async (params = {}) => {
    const response = await api.get('/analytics/orders', { params });
    return response.data;
  },

  // Get lead analytics
  getLeadAnalytics: async (params = {}) => {
    const response = await api.get('/analytics/leads', { params });
    return response.data;
  },

  // Get credit usage analytics
  getCreditAnalytics: async (params = {}) => {
    const response = await api.get('/analytics/credit', { params });
    return response.data;
  },

  // Generate report
  generateReport: async (type, params = {}) => {
    const response = await api.get(`/analytics/reports/${type}`, { 
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

export default analyticsService;

