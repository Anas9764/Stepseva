import api from './api';

export const productService = {
  getAllProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getFeaturedProducts: async () => {
    const response = await api.get('/products?featured=true&limit=8');
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  searchProducts: async (query) => {
    const response = await api.get(`/products?search=${query}`);
    return response.data;
  },
};

