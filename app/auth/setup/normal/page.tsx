'use client';

import { useState } from 'react';
import { User, Phone, MapPin, Save } from 'lucide-react';
import Image from 'next/image';

export default function NormalAccountSetup() {
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType: 'normal',
          ...formData
        })
      });

      if (response.ok) {
        window.location.href = '/';
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
            <h1 className="text-2xl font-bold text-gray-900">Compte Donateur</h1>
            <p className="text-gray-600">Complétez votre profil (optionnel)</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Votre adresse complète"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Présentation
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4FBA73] focus:border-transparent"
                rows={4}
                placeholder="Parlez-nous de votre motivation à soutenir les jeunes footballeurs..."
              />
            </div>

            {/* Boutons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => window.location.href = '/'}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50"
              >
                Passer
              </button>
              <button
                type="submit"
                disabled={loading}
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