import api from './api';

export const categoryService = {
  getAllCategories: async () => {
    try {
      // Use B2B categories endpoint - no categoryType parameter needed
      const response = await api.get('/b2b/categories');
      console.log('📥 B2B Category Service Response:', response);
      console.log('📥 B2B Category Service Response.data:', response.data);
      // Backend returns { success: true, data: [...] }
      // axios wraps it in response.data, so response.data = { success: true, data: [...] }
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data; // Return the categories array
      }
      // Fallback: if data is directly an array
      if (Array.isArray(response.data)) {
        return response.data;
      }
      // If structure is different, return data property or empty array
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('❌ Error fetching B2B categories:', error);
      throw error;
    }
  },

  getCategoryById: async (id) => {
    const response = await api.get(`/b2b/categories/${id}`);
    return response.data;
  },
};

export default categoryService;

