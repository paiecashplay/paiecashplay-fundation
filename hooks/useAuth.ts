import { create } from 'zustand';
import { api } from '@/lib/api';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      
      set({ user, isLoading: false });
    } catch (error) {
      set({ error: 'Erreur de connexion', isLoading: false });
      throw error;
    }
  },

  loginWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null });
      window.location.href = '/auth/google';
    } catch (error) {
      set({ error: 'Erreur de connexion Google', isLoading: false });
      throw error;
    }
  },

  loginWithApple: async () => {
    try {
      set({ isLoading: true, error: null });
      window.location.href = '/auth/apple';
    } catch (error) {
      set({ error: 'Erreur de connexion Apple', isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      delete api.defaults.headers.common.Authorization;
      set({ user: null, isLoading: false });
    } catch (error) {
      set({ error: 'Erreur de déconnexion', isLoading: false });
      throw error;
    }
  },

  register: async (email: string, password: string, name: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/auth/register', { email, password, name });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      
      set({ user, isLoading: false });
    } catch (error) {
      set({ error: "Erreur d'inscription", isLoading: false });
      throw error;
    }
  },
}));