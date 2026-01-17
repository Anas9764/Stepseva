import api from './api';

/**
 * Category Service - Updated for separated B2B/B2C flows
 * @param {string} section - 'b2b' or 'b2c' (defaults to detecting from route)
 */
export const categoryService = {
  getAllCategories: async (section = null) => {
    try {
      // Determine endpoint based on section
      const endpoint = section === 'b2b' ? '/b2b/categories' : section === 'b2c' ? '/b2c/categories' : '/categories';
      const response = await api.get(endpoint);
      console.log('📥 Categories API Response:', response.data);
      // Backend returns { success: true, data: [...] }
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return { success: true, data: response.data.data };
      }
      // Fallback
      if (Array.isArray(response.data)) {
        return { success: true, data: response.data };
      }
      return response.data || { success: true, data: [] };
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      throw error;
    }
  },

  getCategoryById: async (id, section = null) => {
    const endpoint = section === 'b2b' ? '/b2b/categories' : section === 'b2c' ? '/b2c/categories' : '/categories';
    const response = await api.get(`${endpoint}/${id}`);
    return response.data;
  },

  createCategory: async (categoryData, section = null) => {
    try {
      // Determine endpoint based on section
      const endpoint = section === 'b2b' ? '/b2b/categories' : section === 'b2c' ? '/b2c/categories' : '/categories';
      const response = await api.post(endpoint, categoryData);
      console.log('📥 Create Category Response:', response.data);
      // Backend returns { success: true, data: category }
      if (response.data && response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return response.data;
    } catch (error) {
      console.error('❌ Error creating category:', error);
      throw error;
    }
  },

  updateCategory: async (id, categoryData, section = null) => {
    try {
      // Determine endpoint based on section
      const endpoint = section === 'b2b' ? '/b2b/categories' : section === 'b2c' ? '/b2c/categories' : '/categories';
      const response = await api.put(`${endpoint}/${id}`, categoryData);
      console.log('📥 Update Category Response:', response.data);
      // Backend returns { success: true, data: category }
      if (response.data && response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return response.data;
    } catch (error) {
      console.error('❌ Error updating category:', error);
      throw error;
    }
  },

  deleteCategory: async (id, section = null) => {
    const endpoint = section === 'b2b' ? '/b2b/categories' : section === 'b2c' ? '/b2c/categories' : '/categories';
    const response = await api.delete(`${endpoint}/${id}`);
    return response.data;
  },
};

export default categoryService;
