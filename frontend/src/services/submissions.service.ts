import api from './api';

export const submissionsService = {
  submit: (data: Record<string, unknown>) => api.post('/submissions', data),
  submitFile: (data: FormData) => api.post('/submissions', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getByTask: (taskId: string) => api.get(`/submissions/task/${taskId}`),
  getMine: (params?: Record<string, unknown>) => api.get('/submissions/my', { params }),
  getLecturer: (params?: Record<string, unknown>) => api.get('/submissions/lecturer', { params }),
  grade: (id: string, data: { score: number; maxScore: number; feedback?: string }) =>
    api.post(`/submissions/${id}/grade`, data),
};
