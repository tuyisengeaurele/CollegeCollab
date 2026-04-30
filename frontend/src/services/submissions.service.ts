import api from './api';

export const submissionsService = {
  submit: (data: FormData) =>
    api.post('/submissions', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getByTask: (taskId: string) => api.get(`/submissions/task/${taskId}`),
  getMine: (params?: Record<string, unknown>) => api.get('/submissions/my', { params }),
  resubmit: (id: string, data: FormData) =>
    api.put(`/submissions/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};
