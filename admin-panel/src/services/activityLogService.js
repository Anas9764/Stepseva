import api from './api';

export const activityLogService = {
  getAllLogs: async (params = {}) => {
    const response = await api.get('/activity-logs', { params });
    return response.data;
  },

  getLogById: async (id) => {
    const response = await api.get(`/activity-logs/${id}`);
    return response.data;
  },

  getStats: async (params = {}) => {
    const response = await api.get('/activity-logs/stats', { params });
    return response.data;
  },

  deleteLogs: async (filters) => {
    const response = await api.delete('/activity-logs', { data: filters });
    return response.data;
  },
};

export default activityLogService;

