import api from './api';

export const categoryService = {
  getAllCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
};

export default categoryService;

