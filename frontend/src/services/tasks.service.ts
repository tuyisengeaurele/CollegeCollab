import api from './api';

export const tasksService = {
  getAll: (params?: Record<string, unknown>) => api.get('/tasks', { params }),
  getById: (id: string) => api.get(`/tasks/${id}`),
  create: (data: unknown) => api.post('/tasks', data),
  update: (id: string, data: unknown) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  getMyTasks: (params?: Record<string, unknown>) => api.get('/tasks/my', { params }),
};
