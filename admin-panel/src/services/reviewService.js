import api from './api';

export const reviewService = {
  getAllReviews: async (params = {}) => {
    const response = await api.get('/reviews', { params });
    return response.data;
  },

  approveReview: async (reviewId, isApproved) => {
    const response = await api.put(`/reviews/${reviewId}/approve`, { isApproved });
    return response.data;
  },

  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};

