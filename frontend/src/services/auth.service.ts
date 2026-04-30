import api from './api';
import type { LoginCredentials, RegisterData } from '@/types';

export const authService = {
  login: (credentials: LoginCredentials) =>
    api.post('/auth/login', credentials),

  register: (data: RegisterData) =>
    api.post('/auth/register', data),

  logout: () =>
    api.post('/auth/logout'),

  getMe: () =>
    api.get('/auth/me'),

  refreshToken: () =>
    api.post('/auth/refresh'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};
