import api from './api';

export const announcementsService = {
  getAll: () => api.get('/announcements'),
  create: (data: { title: string; content: string; courseId?: string }) => api.post('/announcements', data),
};
