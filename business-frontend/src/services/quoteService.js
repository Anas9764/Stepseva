import api from './api';

export const quoteService = {
  // Get buyer's quotes
  getMyQuotes: async (params = {}) => {
    const response = await api.get('/quotes/my-quotes', { params });
    return response.data;
  },

  // Get quote by ID
  getQuoteById: async (id) => {
    const response = await api.get(`/quotes/${id}`);
    return response.data;
  },

  // Accept a quote
  acceptQuote: async (id) => {
    const response = await api.put(`/quotes/${id}/accept`);
    return response.data;
  },

  // Reject a quote
  rejectQuote: async (id, reason) => {
    const response = await api.put(`/quotes/${id}/reject`, { reason });
    return response.data;
  },

  // Download quote PDF
  downloadQuotePDF: async (id) => {
    const response = await api.get(`/quotes/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Request quote from inquiry
  requestQuoteFromInquiry: async (inquiryId) => {
    const response = await api.post(`/leads/${inquiryId}/request-quote`);
    return response.data;
  },

  // Convert quote to order
  convertQuoteToOrder: async (quoteId, orderData) => {
    const response = await api.post(`/quotes/${quoteId}/convert-to-order`, orderData);
    return response.data;
  },
};

export default quoteService;

