import api from './api';

export const categoryService = {
  getAllCategories: async () => {
    // Use B2C categories endpoint
    const response = await api.get('/b2c/categories');
    // Backend returns { success: true, data: [...] }
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    // Fallback: if data is directly an array
    if (Array.isArray(response.data)) {
    return response.data;
    }
    // If structure is different, return data property or empty array
    return response.data?.data || response.data || [];
  },

  getCategoryById: async (id) => {
    const response = await api.get(`/b2c/categories/${id}`);
    return response.data;
  },
};

export default categoryService;

