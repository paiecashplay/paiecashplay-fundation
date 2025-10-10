'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface SystemHealth {
  all_systems_operational: boolean;
  details: {
    webhook_data_storage: boolean;
    parrain_creation: boolean;
    statistics_accuracy: boolean;
    donor_dashboard: boolean;
    player_profile: boolean;
    club_profile: boolean;
    issues: string[];
  };
  summary: {
    donations_stored: number;
    total_amount: number;
    parrains_count: number;
    players_count: number;
    issues_count: number;
  };
  recommendations: string[];
}

export default function SystemHealthCheck() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSystemHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/donations/verify-system');
      const result = await response.json();
      
      if (result.success) {
        setHealth(result);
      } else {
        setError(result.error || 'Erreur de vérification');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
          <span>Vérification du système...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-600">Erreur: {error}</span>
          </div>
          <button
            onClick={checkSystemHealth}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!health) return null;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {health.all_systems_operational ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            )}
            <div>
              <h3 className="text-lg font-semibold">
                État du Système de Donations
              </h3>
              <p className={`text-sm ${health.all_systems_operational ? 'text-green-600' : 'text-yellow-600'}`}>
                {health.all_systems_operational 
                  ? 'Tous les systèmes sont opérationnels' 
                  : `${health.details.issues.length} problème(s) détecté(s)`
                }
              </p>
            </div>
          </div>
          <button
            onClick={checkSystemHealth}
            className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg"
            title="Actualiser"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="p-6 border-b bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {health.summary.donations_stored}
            </div>
            <div className="text-sm text-gray-600">Donations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {health.summary.total_amount}€
            </div>
            <div className="text-sm text-gray-600">Total collecté</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {health.summary.parrains_count}
            </div>
            <div className="text-sm text-gray-600">Parrains</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {health.summary.players_count}
            </div>
            <div className="text-sm text-gray-600">Joueurs</div>
          </div>
        </div>
      </div>

      {/* Détails des vérifications */}
      <div className="p-6">
        <h4 className="font-semibold mb-4">Vérifications détaillées</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Stockage des données webhook</span>
            <div className="flex items-center space-x-2">
              {getStatusIcon(health.details.webhook_data_storage)}
              <span className={`text-sm ${getStatusColor(health.details.webhook_data_storage)}`}>
                {health.details.webhook_data_storage ? 'OK' : 'Problème'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Création des parrains</span>
            <div className="flex items-center space-x-2">
              {getStatusIcon(health.details.parrain_creation)}
              <span className={`text-sm ${getStatusColor(health.details.parrain_creation)}`}>
                {health.details.parrain_creation ? 'OK' : 'Problème'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Précision des statistiques</span>
            <div className="flex items-center space-x-2">
              {getStatusIcon(health.details.statistics_accuracy)}
              <span className={`text-sm ${getStatusColor(health.details.statistics_accuracy)}`}>
                {health.details.statistics_accuracy ? 'OK' : 'Problème'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Dashboard donateur</span>
            <div className="flex items-center space-x-2">
              {getStatusIcon(health.details.donor_dashboard)}
              <span className={`text-sm ${getStatusColor(health.details.donor_dashboard)}`}>
                {health.details.donor_dashboard ? 'OK' : 'Problème'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Profils joueurs</span>
            <div className="flex items-center space-x-2">
              {getStatusIcon(health.details.player_profile)}
              <span className={`text-sm ${getStatusColor(health.details.player_profile)}`}>
                {health.details.player_profile ? 'OK' : 'Problème'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Profils clubs</span>
            <div className="flex items-center space-x-2">
              {getStatusIcon(health.details.club_profile)}
              <span className={`text-sm ${getStatusColor(health.details.club_profile)}`}>
                {health.details.club_profile ? 'OK' : 'Problème'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Problèmes détectés */}
      {health.details.issues.length > 0 && (
        <div className="p-6 border-t bg-red-50">
          <h4 className="font-semibold text-red-800 mb-3">Problèmes détectés</h4>
          <ul className="space-y-2">
            {health.details.issues.map((issue, index) => (
              <li key={index} className="flex items-start space-x-2">
                <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-red-700">{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommandations */}
      {health.recommendations.length > 0 && (
        <div className="p-6 border-t bg-blue-50">
          <h4 className="font-semibold text-blue-800 mb-3">Recommandations</h4>
          <ul className="space-y-2">
            {health.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-blue-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}