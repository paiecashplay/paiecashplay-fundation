'use client';

import { useState, useEffect } from 'react';
import { Trophy, Calendar, Flag, Phone, Save } from 'lucide-react';
import Image from 'next/image';

interface Club {
  id: string;
  nom: string;
  ville: string;
  pays_nom: string;
}

export default function PlayerAccountSetup() {
  const [formData, setFormData] = useState({
    playerNumber: '',
    position: '',
    dateOfBirth: '',
    nationality: '',
    parentContact: '',
    clubId: ''
  });
  const [loading, setLoading] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(true);

  const positions = [
    'Gardien de but',
    'Défenseur central',
    'Arrière latéral',
    'Milieu défensif',
    'Milieu central',
    'Milieu offensif',
    'Ailier',
    'Attaquant'
  ];

  useEffect(() => {
    // Charger les clubs
    const fetchClubs = async () => {
      try {
        const response = await fetch('/api/clubs');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setClubs(data.data);
          }
        }
      } catch (error) {
        console.error('Erreur chargement clubs:', error);
      } finally {
        setLoadingClubs(false);
      }
    };

    fetchClubs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType: 'player',
          ...formData
        })
      });

      if (response.ok) {
        window.location.href = '/dashboard';
      } else {
        alert('Une erreur est survenue. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur setup:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4">
              <Image 
                src="/logo.png" 
                alt="PaieCashPlay Logo" 
                width={80} 
                height={80}
                className="rounded-full"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Compte Joueur</h1>
            <p className="text-gray-600">Informations du joueur</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Numéro de joueur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Trophy className="w-4 h-4 inline mr-2" />
                Numéro de joueur
              </label>
              <input
                type="text"
                value={formData.playerNumber}
                onChange={(e) => setFormData({...formData, playerNumber: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4FBA73] focus:border-transparent"
                placeholder="Ex: 10"
              />
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position sur le terrain *
              </label>
              <select
                required
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4FBA73] focus:border-transparent"
              >
                <option value="">Sélectionnez une position</option>
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            {/* Club */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Club
              </label>
              <select
                value={formData.clubId}
                onChange={(e) => setFormData({...formData, clubId: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4FBA73] focus:border-transparent"
                disabled={loadingClubs}
              >
                <option value="">Sélectionnez un club</option>
                {clubs.map(club => (
                  <option key={club.id} value={club.id}>
                    {club.nom} ({club.ville}, {club.pays_nom})
                  </option>
                ))}
              </select>
              {loadingClubs && (
                <p className="text-xs text-gray-500 mt-1">Chargement des clubs...</p>
              )}
            </div>

            {/* Date de naissance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date de naissance *
              </label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4FBA73] focus:border-transparent"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Nationalité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Flag className="w-4 h-4 inline mr-2" />
                Nationalité
              </label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4FBA73] focus:border-transparent"
                placeholder="Ex: Sénégalaise"
              />
            </div>

            {/* Contact parent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Contact parent/tuteur *
              </label>
              <input
                type="tel"
                required
                value={formData.parentContact}
                onChange={(e) => setFormData({...formData, parentContact: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4FBA73] focus:border-transparent"
                placeholder="+33 1 23 45 67 89"
              />
              <p className="text-xs text-gray-500 mt-1">Nécessaire pour les joueurs mineurs</p>
            </div>

            {/* Boutons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50"
              >
                Passer
              </button>
              <button
                type="submit"
                disabled={loading || !formData.position || !formData.dateOfBirth || !formData.parentContact}
                className="flex-1 bg-gradient-to-r from-[#4FBA73] to-[#3da562] text-white py-3 px-6 rounded-lg hover:from-[#3da562] hover:to-[#2d8a4e] disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Finaliser</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}