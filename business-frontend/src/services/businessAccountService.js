import api from './api';

export const businessAccountService = {
  // Create business account
  createBusinessAccount: async (accountData) => {
    const response = await api.post('/business-accounts', accountData);
    return response.data;
  },

  // Get current user's business account
  getMyBusinessAccount: async () => {
    const response = await api.get('/business-accounts/me');
    return response.data;
  },

  // Update business account
  updateBusinessAccount: async (accountData) => {
    const response = await api.put('/business-accounts/me', accountData);
    return response.data;
  },

  // Get all business accounts (Admin only)
  getAllBusinessAccounts: async (params = {}) => {
    const response = await api.get('/business-accounts', { params });
    return response.data;
  },
};

export default businessAccountService;

