import api from './api';

export const productService = {
  getAllProducts: async (params = {}) => {
    // Use B2C products endpoint
    const response = await api.get('/b2c/products', { params });
    // Backend returns { success: true, data: [...], pagination: {...} }
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return {
        data: response.data.data,
        pagination: response.data.pagination,
        total: response.data.total,
      };
    }
    // Fallback
    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        pagination: {},
        total: response.data.length,
      };
    }
    return {
      data: response.data?.data || response.data || [],
      pagination: response.data?.pagination || {},
      total: response.data?.total || 0,
    };
  },

  getProductById: async (id) => {
    const response = await api.get(`/b2c/products/${id}`);
    return response.data;
  },

  getFeaturedProducts: async () => {
    const response = await api.get('/b2c/products?featured=true&limit=8');
    // Backend returns { success: true, data: [...], pagination: {...} }
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    }
    return {
      data: response.data?.data || response.data || [],
      pagination: response.data?.pagination || {},
    };
  },

  createProduct: async (productData) => {
    const response = await api.post('/b2c/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/b2c/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/b2c/products/${id}`);
    return response.data;
  },

  searchProducts: async (query) => {
    const response = await api.get(`/b2c/products?search=${query}`);
    return response.data;
  },
};

