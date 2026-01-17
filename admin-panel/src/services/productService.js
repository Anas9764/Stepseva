import api from './api';

/**
 * Product Service - Updated for separated B2B/B2C flows
 * @param {string} section - 'b2b' or 'b2c' (defaults to detecting from route)
 */
export const productService = {
  getAllProducts: async (params = {}, section = null) => {
    try {
      // Determine endpoint based on section
      const endpoint = section === 'b2b' ? '/b2b/products' : section === 'b2c' ? '/b2c/products' : '/products';
      const response = await api.get(endpoint, { params });
      console.log('📥 Products API Response:', response.data);
      // Backend returns { success: true, data: [...], pagination: {...} }
      if (response.data && response.data.success) {
        return {
          data: Array.isArray(response.data.data) ? response.data.data : [],
          pagination: response.data.pagination || {},
          total: response.data.total || 0,
        };
      }
      // Fallback
      return {
        data: Array.isArray(response.data) ? response.data : [],
        pagination: {},
        total: 0,
      };
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      throw error;
    }
  },

  getProductById: async (id, section = null) => {
    const endpoint = section === 'b2b' ? '/b2b/products' : section === 'b2c' ? '/b2c/products' : '/products';
    const response = await api.get(`${endpoint}/${id}`);
    return response.data;
  },

  createProduct: async (productData, section = null) => {
    const endpoint = section === 'b2b' ? '/b2b/products' : section === 'b2c' ? '/b2c/products' : '/products';
    const response = await api.post(endpoint, productData);
    return response.data;
  },

  updateProduct: async (id, productData, section = null) => {
    const endpoint = section === 'b2b' ? '/b2b/products' : section === 'b2c' ? '/b2c/products' : '/products';
    const response = await api.put(`${endpoint}/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id, section = null) => {
    const endpoint = section === 'b2b' ? '/b2b/products' : section === 'b2c' ? '/b2c/products' : '/products';
    const response = await api.delete(`${endpoint}/${id}`);
    return response.data;
  },

  uploadImage: async (formData) => {
    // Upload endpoint is shared, no need for section parameter
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default productService;
