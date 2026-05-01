import api from './api';

export const departmentsService = {
  getAll: () => api.get('/departments'),
  create: (data: { name: string; code: string; description?: string }) => api.post('/departments', data),
  update: (id: string, data: { name?: string; code?: string; description?: string }) => api.put(`/departments/${id}`, data),
  delete: (id: string) => api.delete(`/departments/${id}`),
};
