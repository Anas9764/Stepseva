import api from './api';

export const leadService = {
  // Create a new lead/inquiry (Public - no auth required)
  createLead: async (leadData) => {
    const response = await api.post('/leads', leadData);
    return response.data;
  },

  // Get buyer's own inquiries (Protected)
  getMyInquiries: async (params = {}) => {
    const response = await api.get('/leads/my-inquiries', { params });
    return response.data;
  },

  // Get inquiry by ID (for buyers)
  getInquiryById: async (id) => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  // Request quote from inquiry
  requestQuoteFromInquiry: async (inquiryId) => {
    const response = await api.post(`/leads/${inquiryId}/request-quote`);
    return response.data;
  },

  // Admin: Get all leads
  getAllLeads: async (params = {}) => {
    const response = await api.get('/leads', { params });
    return response.data;
  },

  // Admin: Get single lead
  getLeadById: async (id) => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  // Admin: Update lead
  updateLead: async (id, updateData) => {
    const response = await api.put(`/leads/${id}`, updateData);
    return response.data;
  },

  // Admin: Get lead statistics
  getLeadStats: async (params = {}) => {
    const response = await api.get('/leads/stats', { params });
    return response.data;
  },
};

