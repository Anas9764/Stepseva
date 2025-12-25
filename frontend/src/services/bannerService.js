import api from './api';

export const bannerService = {
  getActiveBanners: async () => {
    try {
      const response = await api.get('/banners');
      // Backend returns: { success: true, data: [...] }
      // Return the data array directly
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      // Fallback: if response.data is already an array
      if (Array.isArray(response.data)) {
        return response.data;
      }
      // Fallback: return empty array
      console.warn('Unexpected banner response format:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching banners:', error);
      throw error;
    }
  },
};

export default bannerService;

