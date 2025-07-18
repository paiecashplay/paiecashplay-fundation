'use client';

import { useState, useEffect } from 'react';
import { Users, User, Globe, Mail, Phone, MapPin, Save } from 'lucide-react';
import Image from 'next/image';

interface Federation {
  id: string;
  nom: string;
  pays_nom: string;
}

export default function ClubAccountSetup() {
  const [formData, setFormData] = useState({
    clubCode: '',
    presidentName: '',
    coachName: '',
    foundedYear: '',
    website: '',
    officialEmail: '',
    phone: '',
    address: '',
    description: '',
    federationId: ''
  });
  const [loading, setLoading] = useState(false);
  const [federations, setFederations] = useState<Federation[]>([]);
  const [loadingFederations, setLoadingFederations] = useState(true);

  useEffect(() => {
    // Charger les fédérations
    const fetchFederations = async () => {
      try {
        const response = await fetch('/api/federations');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setFederations(data.data);
          }
        }
      } catch (error) {
        console.error('Erreur chargement fédérations:', error);
      } finally {
        setLoadingFederations(false);
      }
    };

    fetchFederations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType: 'club',
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
            <h1 className="text-2xl font-bold text-gray-900">Compte Club</h1>
            <p className="text-gray-600">Informations de votre club</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Code club */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Code Club *
              </label>
              <input
                type="text"
                required
                value={formData.clubCode}
                onChange={(e) => setFormData({...formData, clubCode: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4FBA73] focus:border-transparent"
                placeholder="Ex: ASC, RAJA, TP..."
              />
              <p className="text-xs text-gray-500 mt-1">Code unique de votre club</p>
            </div>

            {/* Fédération */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fédération *
              </label>
              <select
                required
                value={formData.federationId}
                onChange={(e) => setFormData({...formData, federationId: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4FBA73] focus:border-transparent"
                disabled={loadingFederations}
              >
                <option value="">Sélectionnez une fédération</option>
                {federations.map(fed => (
                  <option key={fed.id} value={fed.id}>
                    {fed.nom} ({fed.pays_nom})
                  </option>
                ))}
              </select>
              {loadingFederations && (
                <p className="text-xs text-gray-500 mt-1">Chargement des fédérations...</p>
              )}
            </div>

            {/* Président */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nom du Président
              </label>
              <input
                type="text"
                value={formData.presidentName}
                onChange={(e) => setFormData({...formData, presidentName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4FBA73] focus:border-transparent"
                placeholder="Nom complet du président"
              />
            </div>

            {/* Entraîneur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nom de l'Entraîneur
              </label>
              <input
                type="text"
                value={formData.coachName}
                onChange={(e) => setFormData({...formData, coachName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4FBA73] focus:border-transparent"
                placeholder="Nom complet de l'entraîneur"
              />
            </div>

            {/* Année de fondation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Année de fondation
              </label>
              <input
                type="number"
                min="1800"
                max={new Date().getFullYear()}
                value={formData.foundedYear}
                onChange={(e) => setFormData({...formData, foundedYear: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4FBA73] focus:border-transparent"
                placeholder="Ex: 1960"
              />
            </div>

            {/* Site web */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-2" />
                Site Web
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4FBA73] focus:border-transparent"
                placeholder="https://www.votre-club.com"
              />
            </div>

            {/* Email officiel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Officiel
              </label>
              <input
                type="email"
                value={formData.officialEmail}
                onChange={(e) => setFormData({...formData, officialEmail: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4FBA73] focus:border-transparent"
                placeholder="contact@club.com"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4FBA73] focus:border-transparent"
                placeholder="+33 1 23 45 67 89"
              />
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Adresse
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4FBA73] focus:border-transparent"
                rows={3}
                placeholder="Adresse complète du club"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4FBA73] focus:border-transparent"
                rows={4}
                placeholder="Présentation de votre club..."
              />
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
                disabled={loading || !formData.clubCode || !formData.federationId}
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