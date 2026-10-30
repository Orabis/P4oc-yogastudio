import api from './api';
import {AuthResponse, LoginCredentials, RegisterData} from '../types';

const storeAuth = (auth: AuthResponse) => {
  localStorage.setItem('token', auth.token);
  localStorage.setItem('user', JSON.stringify(auth));
  return auth;
};

const getCurrentUser = (): AuthResponse | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const authService = {
  login: async (credentials: LoginCredentials) =>
    storeAuth((await api.post<AuthResponse>('/auth/login', credentials)).data),

  register: async (data: RegisterData) =>
    storeAuth((await api.post<AuthResponse>('/auth/register', data)).data),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser,

  updateCurrentUser: (updates: Partial<AuthResponse>) => {
    const existing = getCurrentUser();
    if (!existing) {
      return null;
    }
    const nextUser = { ...existing, ...updates };
    localStorage.setItem('user', JSON.stringify(nextUser));
    return nextUser;
  },

  getToken: () => localStorage.getItem('token'),

  isAuthenticated: () => !!localStorage.getItem('token'),
};
