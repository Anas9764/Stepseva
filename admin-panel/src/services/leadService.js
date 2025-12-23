import api from './api';

export const leadService = {
  // Get all leads with filters
  getAllLeads: async (params = {}) => {
    const response = await api.get('/leads', { params });
    return response.data;
  },

  // Get single lead by ID
  getLeadById: async (id) => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  // Update lead
  updateLead: async (id, data) => {
    const response = await api.put(`/leads/${id}`, data);
    return response.data;
  },

  // Get lead statistics
  getLeadStats: async (params = {}) => {
    const response = await api.get('/leads/stats', { params });
    return response.data;
  },

  // Delete lead (if needed)
  deleteLead: async (id) => {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  },
};

export default leadService;

