'use client';

import { useState, useEffect } from 'react';
import { keycloakUrls } from '@/lib/keycloak';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  keycloakId: string;
}

export function useKeycloakAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      
      // Si le statut est 401 (non authentifié) ou autre erreur
      if (!response.ok) {
        setUser(null);
        return;
      }
      
      const data = await response.json();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    window.location.href = keycloakUrls.logout;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return { 
    user, 
    loading, 
    logout,
    checkAuth,
    isAdmin: user?.roles?.includes('admin') || false,
    isFederation: user?.roles?.includes('federation') || false,
    isClub: user?.roles?.includes('club') || false,
    isPlayer: user?.roles?.includes('player') || false,
    isUser: user?.roles?.includes('user') || false,
  };
}