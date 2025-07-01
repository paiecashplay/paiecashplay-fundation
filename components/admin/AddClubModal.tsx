'use client';

import { useState } from 'react';
import { X, MapPin } from 'lucide-react';

interface AddClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (clubData: any) => void;
  countryName: string;
}

export default function AddClubModal({ isOpen, onClose, onAdd, countryName }: AddClubModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    founded: '',
    stadium: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClub = {
      id: Date.now(),
      name: formData.name,
      city: formData.city,
      children: 0,
      needsLicense: 0,
      totalDonations: 0,
      founded: formData.founded,
      stadium: formData.stadium
    };
    onAdd(newClub);
    setFormData({ name: '', city: '', founded: '', stadium: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="relative p-6 border-b border-gray-100">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">Ajouter un club</h2>
          <p className="text-gray-600">Pays: {countryName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du club *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73] outline-none"
                placeholder="Ex: ASC Jaraaf"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73] outline-none"
                  placeholder="Ex: Dakar"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Année de fondation</label>
              <input
                type="number"
                min="1800"
                max="2024"
                value={formData.founded}
                onChange={(e) => setFormData({...formData, founded: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73] outline-none"
                placeholder="Ex: 1923"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stade</label>
              <input
                type="text"
                value={formData.stadium}
                onChange={(e) => setFormData({...formData, stadium: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73] outline-none"
                placeholder="Ex: Stade Léopold Sédar Senghor"
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#4FBA73] hover:bg-[#3da562] text-white py-2 px-4 rounded-lg"
            >
              Ajouter le club
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}