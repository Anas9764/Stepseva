import api from './api';

export const questionService = {
  getProductQuestions: async (productId, params = {}) => {
    const response = await api.get(`/questions/product/${productId}`, { params });
    return response.data;
  },

  createQuestion: async (questionData) => {
    const response = await api.post('/questions', questionData);
    return response.data;
  },

  answerQuestion: async (questionId, answer) => {
    const response = await api.post(`/questions/${questionId}/answer`, { answer });
    return response.data;
  },

  updateAnswer: async (questionId, answerId, answer) => {
    const response = await api.put(`/questions/${questionId}/answer/${answerId}`, { answer });
    return response.data;
  },

  deleteQuestion: async (questionId) => {
    const response = await api.delete(`/questions/${questionId}`);
    return response.data;
  },

  deleteAnswer: async (questionId, answerId) => {
    const response = await api.delete(`/questions/${questionId}/answer/${answerId}`);
    return response.data;
  },

  markHelpful: async (questionId, answerId = null) => {
    const params = answerId ? { answerId } : {};
    const response = await api.post(`/questions/${questionId}/helpful`, null, { params });
    return response.data;
  },
};

