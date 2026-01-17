import api from './api';

export const bannerService = {
  getActiveBanners: async ({ placement } = {}) => {
    try {
      // Use B2B banners endpoint - no bannerType parameter needed
      const params = {};
      if (placement) params.placement = placement;
      const response = await api.get('/b2b/banners', { params });
      console.log('📥 B2B Banner Service Response:', response);
      console.log('📥 B2B Banner Service Response.data:', response.data);
      // Backend returns { success: true, data: [...] }
      // axios wraps it in response.data, so response.data = { success: true, data: [...] }
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data; // Return the banners array
      }
      // Fallback: if data is directly an array
      if (Array.isArray(response.data)) {
        return response.data;
      }
      // If structure is different, return data property or empty array
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('❌ Error fetching B2B banners:', error);
      throw error;
    }
  },
};

export default bannerService;

