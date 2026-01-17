import api from './api';

export const productService = {
  getAllProducts: async (params = {}) => {
    try {
      const response = await api.get('/b2b/products', { params });
      console.log('📥 B2B Product Service Response:', response);
      console.log('📥 B2B Product Service Response.data:', response.data);
      // Backend returns { success: true, data: [...], pagination: {...} }
      // axios wraps it in response.data, so response.data = { success: true, data: [...] }
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return {
          data: response.data.data,
          pagination: response.data.pagination,
        };
      }
      // Fallback: if data is directly an array
      if (Array.isArray(response.data)) {
        return {
          data: response.data,
          pagination: {},
        };
      }
      // If structure is different, return data property or empty array
      return {
        data: response.data?.data || response.data || [],
        pagination: response.data?.pagination || {},
      };
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      throw error;
    }
  },

  getProductById: async (id) => {
    const response = await api.get(`/b2b/products/${id}`);
    return response.data;
  },

  getFeaturedProducts: async () => {
    try {
      const response = await api.get('/b2b/products?featured=true&limit=8');
      console.log('📥 Featured Products Response:', response.data);
      // Backend returns { success: true, data: [...], pagination: {...} }
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return {
          data: response.data.data,
          pagination: response.data.pagination,
        };
      }
      // Fallback
      return {
        data: response.data?.data || response.data || [],
        pagination: response.data?.pagination || {},
      };
    } catch (error) {
      console.error('❌ Error fetching featured products:', error);
      throw error;
    }
  },

  createProduct: async (productData) => {
    const response = await api.post('/b2b/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/b2b/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/b2b/products/${id}`);
    return response.data;
  },

  searchProducts: async (query) => {
    const response = await api.get(`/b2b/products?search=${query}`);
    return response.data;
  },
};

