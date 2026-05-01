import api from './api';

export const messagesService = {
  getContacts: () => api.get('/messages/contacts'),
  getUsers: () => api.get('/messages/users'),
  getThread: (userId: string) => api.get(`/messages/${userId}`),
  send: (receiverId: string, content: string) => api.post('/messages', { receiverId, content }),
};
