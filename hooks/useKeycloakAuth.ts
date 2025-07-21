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
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/me');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
        
        // Si le token est expiré, essayer de le rafraîchir
        if (response.status === 401) {
          await refreshToken();
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setError('Erreur de vérification d\'authentification');
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      // Récupérer le refresh token depuis un cookie sécurisé
      // Note: Ceci est géré côté serveur, nous faisons juste une requête
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grant_type: 'refresh_token' })
      });

      if (response.ok) {
        // Token rafraîchi avec succès, vérifier à nouveau l'authentification
        await checkAuth();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Appeler l'API de déconnexion pour supprimer les cookies
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Rediriger vers la page de déconnexion Keycloak
      window.location.href = keycloakUrls.logout;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return { 
    user, 
    loading,
    error,
    logout,
    checkAuth,
    refreshToken,
    isAdmin: user?.roles?.includes('admin') || false,
    isFederation: user?.roles?.includes('federation') || false,
    isClub: user?.roles?.includes('club') || false,
    isPlayer: user?.roles?.includes('player') || false,
    isUser: user?.roles?.includes('user') || false,
  };
}