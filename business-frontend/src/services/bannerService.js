import api from './api';

export const bannerService = {
  getActiveBanners: async () => {
    const response = await api.get('/banners');
    return response.data;
  },
};

export default bannerService;

