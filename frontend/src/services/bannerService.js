import api from './api';

export const bannerService = {
  getActiveBanners: async ({ placement } = {}) => {
    try {
      // Use B2C banners endpoint - no bannerType parameter needed
      const params = {};
      if (placement) params.placement = placement;
      const response = await api.get('/b2c/banners', { params });
      console.log('📥 B2C Banner Service Response:', response);
      // Backend returns { success: true, data: [...] }
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      // Fallback: if data is directly an array
      if (Array.isArray(response.data)) {
        return response.data;
      }
      // If structure is different, return data property or empty array
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('❌ Error fetching B2C banners:', error);
      throw error;
    }
  },
};

export default bannerService;

