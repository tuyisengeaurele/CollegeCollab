import api from './api';

export const coursesService = {
  getAll: (params?: Record<string, unknown>) => api.get('/courses', { params }),
  getById: (id: string) => api.get(`/courses/${id}`),
  getMine: () => api.get('/courses/my'),
  create: (data: unknown) => api.post('/courses', data),
  update: (id: string, data: unknown) => api.put(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
  enroll: (courseId: string) => api.post(`/courses/${courseId}/enroll`),
  unenroll: (courseId: string) => api.delete(`/courses/${courseId}/unenroll`),
  getStudents: (courseId: string) => api.get(`/courses/${courseId}/students`),
};
