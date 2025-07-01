'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
      setUser(data.user);
    } catch (error) {
      setError('Erreur de connexion');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    } catch (error) {
      setError('Erreur de connexion Google');
      throw error;
    }
  };

  const loginWithApple = async () => {
    try {
      setIsLoading(true);
      setError(null);
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/apple`;
    } catch (error) {
      setError('Erreur de connexion Apple');
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      delete api.defaults.headers.common.Authorization;
      setUser(null);
    } catch (error) {
      setError('Erreur de déconnexion');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await api.post('/auth/register', { email, password, name });
      localStorage.setItem('token', data.token);
      api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
      setUser(data.user);
    } catch (error) {
      setError("Erreur d'inscription");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    loginWithGoogle,
    loginWithApple,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}