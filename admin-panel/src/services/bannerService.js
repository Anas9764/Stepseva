import api from './api';

export const bannerService = {
  getAllBanners: async () => {
    const response = await api.get('/banners/admin');
    return response.data;
  },

  getBannerById: async (id) => {
    const response = await api.get(`/banners/${id}`);
    return response.data;
  },

  createBanner: async (bannerData) => {
    const response = await api.post('/banners', bannerData);
    return response.data;
  },

  updateBanner: async (id, bannerData) => {
    const response = await api.put(`/banners/${id}`, bannerData);
    return response.data;
  },

  deleteBanner: async (id) => {
    const response = await api.delete(`/banners/${id}`);
    return response.data;
  },
};

export default bannerService;

