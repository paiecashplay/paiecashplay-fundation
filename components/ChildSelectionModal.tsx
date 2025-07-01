'use client';

import { useState, useEffect } from 'react';
import { X, Search, MapPin, Users } from 'lucide-react';

interface Child {
  id: number;
  name: string;
  age: number;
  position: string;
  hasLicense: boolean;
  photo: string;
  club: string;
  country: string;
  federation: string;
  flag: string;
}

interface ChildSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChild: (child: Child) => void;
  packTitle: string;
}

// Données simulées des enfants sans licence
const availableChildren: Child[] = [
  {
    id: 1,
    name: 'Mamadou Diallo',
    age: 12,
    position: 'Attaquant',
    hasLicense: false,
    photo: '👦🏿',
    club: 'ASC Jaraaf',
    country: 'Sénégal',
    federation: 'FSF',
    flag: '🇸🇳'
  },
  {
    id: 3,
    name: 'Ousmane Ba',
    age: 14,
    position: 'Défenseur',
    hasLicense: false,
    photo: '👦🏿',
    club: 'US Gorée',
    country: 'Sénégal',
    federation: 'FSF',
    flag: '🇸🇳'
  },
  {
    id: 4,
    name: 'Kemi Adebayo',
    age: 11,
    position: 'Gardien',
    hasLicense: false,
    photo: '👧🏿',
    club: 'Kano Pillars',
    country: 'Nigeria',
    federation: 'NFF',
    flag: '🇳🇬'
  },
  {
    id: 5,
    name: 'Kwame Asante',
    age: 13,
    position: 'Milieu',
    hasLicense: false,
    photo: '👦🏿',
    club: 'Hearts of Oak',
    country: 'Ghana',
    federation: 'GFA',
    flag: '🇬🇭'
  }
];

export default function ChildSelectionModal({ isOpen, onClose, onSelectChild, packTitle }: ChildSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  const filteredChildren = availableChildren.filter(child =>
    child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.club.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedChild) {
      onSelectChild(selectedChild);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative p-6 border-b border-gray-100">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">Choisir un enfant</h2>
          <p className="text-gray-600">Pack: {packTitle}</p>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, club ou pays..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-h-96 overflow-y-auto">
            {filteredChildren.map((child) => (
              <div
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedChild?.id === child.id
                    ? 'border-[#4FBA73] bg-[#4FBA73]/5'
                    : 'border-gray-200 hover:border-[#4FBA73]/50'
                }`}
              >
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl mr-3">
                    {child.photo}
                  </div>
                  <div>
                    <h3 className="font-bold">{child.name}</h3>
                    <p className="text-sm text-gray-600">{child.age} ans • {child.position}</p>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{child.club}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">{child.flag}</span>
                    <span>{child.country} ({child.federation})</span>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    Sans licence
                  </span>
                </div>
              </div>
            ))}
          </div>

          {selectedChild && (
            <div className="bg-[#4FBA73]/10 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-[#4FBA73] mb-2">Enfant sélectionné :</h3>
              <div className="flex items-center">
                <span className="text-2xl mr-3">{selectedChild.photo}</span>
                <div>
                  <p className="font-medium">{selectedChild.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedChild.club} • {selectedChild.country}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedChild}
              className="flex-1 bg-[#4FBA73] hover:bg-[#3da562] text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuer avec cet enfant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}