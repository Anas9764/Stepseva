import api from './api';

/**
 * Banner Service - Updated for separated B2B/B2C flows
 * @param {string} section - 'b2b' or 'b2c' (defaults to detecting from route)
 */
export const bannerService = {
  getAllBanners: async (section = null) => {
    try {
      // Determine endpoint based on section
      const endpoint = section === 'b2b' ? '/b2b/banners' : section === 'b2c' ? '/b2c/banners' : '/banners';
      const response = await api.get(`${endpoint}?all=true`);
      console.log('📥 Banner API Response:', response);
      console.log('📥 Banner API Response.data:', response.data);
      // Backend returns { success: true, data: [...] }
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return { success: true, data: response.data.data };
      }
      // Fallback: if data is directly an array
      if (Array.isArray(response.data)) {
        return { success: true, data: response.data };
      }
      // If structure is different, return data property or empty array
      return response.data || { success: true, data: [] };
    } catch (error) {
      console.error('❌ Error fetching banners:', error);
      console.error('❌ Error response:', error.response);
      throw error;
    }
  },

  getBannerById: async (id, section = null) => {
    const endpoint = section === 'b2b' ? '/b2b/banners' : section === 'b2c' ? '/b2c/banners' : '/banners';
    const response = await api.get(`${endpoint}/${id}`);
    return response.data;
  },

  createBanner: async (bannerData, section = null) => {
    try {
      // Determine endpoint based on section
      const endpoint = section === 'b2b' ? '/b2b/banners' : section === 'b2c' ? '/b2c/banners' : '/banners';
      const response = await api.post(endpoint, bannerData);
      console.log('📥 Create Banner Response:', response.data);
      // Backend returns { success: true, data: banner }
      if (response.data && response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return response.data;
    } catch (error) {
      console.error('❌ Error creating banner:', error);
      throw error;
    }
  },

  updateBanner: async (id, bannerData, section = null) => {
    try {
      // Determine endpoint based on section
      const endpoint = section === 'b2b' ? '/b2b/banners' : section === 'b2c' ? '/b2c/banners' : '/banners';
      const response = await api.put(`${endpoint}/${id}`, bannerData);
      console.log('📥 Update Banner Response:', response.data);
      // Backend returns { success: true, data: banner }
      if (response.data && response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return response.data;
    } catch (error) {
      console.error('❌ Error updating banner:', error);
      throw error;
    }
  },

  deleteBanner: async (id, section = null) => {
    const endpoint = section === 'b2b' ? '/b2b/banners' : section === 'b2c' ? '/b2c/banners' : '/banners';
    const response = await api.delete(`${endpoint}/${id}`);
    return response.data;
  },
};

export default bannerService;

