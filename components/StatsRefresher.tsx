'use client';

import { useEffect } from 'react';
import { useStatsStore } from '@/lib/stores/statsStore';
import { cache } from '@/lib/cache';

export default function StatsRefresher() {
  const { refreshStats } = useStatsStore();

  useEffect(() => {
    // Écouter les événements de mise à jour des statistiques
    const handleStatsUpdate = () => {
      cache.invalidateStats();
      refreshStats();
    };

    // Écouter l'événement personnalisé
    window.addEventListener('donation-completed', handleStatsUpdate);
    
    // Écouter les changements de focus de la fenêtre (retour depuis Stripe)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Délai pour laisser le temps au webhook de traiter
        setTimeout(() => {
          cache.invalidateStats();
          refreshStats();
        }, 2000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('donation-completed', handleStatsUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshStats]);

  return null;
}