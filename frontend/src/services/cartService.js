import api from './api';

export const cartService = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  addToCart: async (productId, size = '', quantity = 1) => {
    const response = await api.post('/cart', { productId, size: size || '', quantity });
    return response.data;
  },

  updateQuantity: async (productId, size = '', quantity) => {
    const response = await api.put(`/cart/${productId}`, { size: size || '', quantity });
    return response.data;
  },

  removeFromCart: async (productId, size = '') => {
    const response = await api.delete(`/cart/${productId}?size=${size || ''}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  },
};

export default cartService;

