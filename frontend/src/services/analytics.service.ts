import api from './api';

export const analyticsService = {
  getStudentStats: () => api.get('/analytics/student'),
  getLecturerStats: () => api.get('/analytics/lecturer'),
  getAdminStats: () => api.get('/analytics/admin'),
};
