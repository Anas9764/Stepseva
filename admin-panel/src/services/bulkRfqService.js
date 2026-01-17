import api from './api';

export const bulkRfqService = {
  getAll: async (params = {}) => {
    try {
      console.log('🔗 Calling API: /bulk-rfqs with params:', params);
      const response = await api.get('/bulk-rfqs', { params });
      
      console.log('📥 API Response status:', response.status);
      console.log('📥 API Response data:', response.data);
      
      // Backend returns { success: true, data: [...], pagination: {...} }
      // axios wraps it in response.data, so we get the backend response directly
      if (response.data) {
        // Ensure the response has the expected structure
        if (response.data.success !== false) {
          console.log('✅ Valid response structure received');
          return response.data;
        } else {
          console.warn('⚠️ Response indicates failure:', response.data);
          return response.data;
        }
      }
      
      // If response structure is different, return as-is
      console.warn('⚠️ Unexpected response structure:', response);
      return response.data || response;
    } catch (error) {
      console.error('❌ Error in bulkRfqService.getAll:', error);
      console.error('❌ Error response:', error.response);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/bulk-rfqs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in bulkRfqService.getById:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/bulk-rfqs/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error in bulkRfqService.update:', error);
      throw error;
    }
  },
};

export default bulkRfqService;
