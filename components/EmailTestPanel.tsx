'use client';

import { useState } from 'react';
import { Mail, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface EmailTestResult {
  all_emails_working: boolean;
  results: {
    donor_email: boolean;
    player_email: boolean;
    club_email: boolean;
    admin_email: boolean;
    errors: string[];
  };
  smtp_config: {
    [key: string]: string;
  };
}

export default function EmailTestPanel() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<EmailTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testEmails = async () => {
    try {
      setTesting(true);
      setError(null);
      setResult(null);

      const response = await fetch('/api/donations/test-emails', {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Erreur de test');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getConfigIcon = (status: string) => {
    return status.includes('✓') ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Mail className="w-6 h-6 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold">Test du Système d'Emails</h3>
              <p className="text-gray-600 text-sm">Vérifier l'envoi des notifications de donation</p>
            </div>
          </div>
          <button
            onClick={testEmails}
            disabled={testing}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            {testing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{testing ? 'Test en cours...' : 'Tester les emails'}</span>
          </button>
        </div>
      </div>

      {/* Configuration SMTP */}
      <div className="p-6 border-b bg-gray-50">
        <h4 className="font-semibold mb-3">Configuration SMTP</h4>
        {result ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(result.smtp_config).map(([key, status]) => (
              <div key={key} className="flex items-center space-x-2">
                {getConfigIcon(status)}
                <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                <span className="text-xs text-gray-500">{status}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Lancez un test pour vérifier la configuration</p>
        )}
      </div>

      {/* Résultats des tests */}
      {result && (
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            {result.all_emails_working ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            )}
            <span className={`font-semibold ${result.all_emails_working ? 'text-green-600' : 'text-yellow-600'}`}>
              {result.all_emails_working 
                ? 'Tous les emails fonctionnent correctement' 
                : `${result.results.errors.length} problème(s) détecté(s)`
              }
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Email de remerciement (donateur)</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(result.results.donor_email)}
                <span className="text-sm text-gray-600">
                  {result.results.donor_email ? 'Envoyé' : 'Échec'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>Email de notification (joueur)</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(result.results.player_email)}
                <span className="text-sm text-gray-600">
                  {result.results.player_email ? 'Envoyé' : 'Échec'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>Email de notification (club)</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(result.results.club_email)}
                <span className="text-sm text-gray-600">
                  {result.results.club_email ? 'Envoyé' : 'Échec'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>Email de notification (admin)</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(result.results.admin_email)}
                <span className="text-sm text-gray-600">
                  {result.results.admin_email ? 'Envoyé' : 'Échec'}
                </span>
              </div>
            </div>
          </div>

          {/* Erreurs */}
          {result.results.errors.length > 0 && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg">
              <h5 className="font-semibold text-red-800 mb-2">Erreurs détectées</h5>
              <ul className="space-y-1">
                {result.results.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700 flex items-start space-x-2">
                    <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Erreur générale */}
      {error && (
        <div className="p-6 border-t">
          <div className="flex items-center space-x-3 text-red-600">
            <XCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="p-6 border-t bg-blue-50">
        <h4 className="font-semibold text-blue-800 mb-2">Types d'emails envoyés lors d'une donation</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Donateur</strong> : Email de remerciement (si email disponible et non anonyme)</li>
          <li>• <strong>Joueur</strong> : Notification du don reçu (si email configuré dans son profil)</li>
          <li>• <strong>Club</strong> : Notification du don pour son membre (si joueur attaché au club avec email)</li>
          <li>• <strong>Administrateur</strong> : Notification complète avec tous les détails</li>
        </ul>
      </div>
    </div>
  );
}