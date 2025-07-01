'use client';

import { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

interface ChangeClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (newClubId: string) => void;
  childName: string;
  currentClub: string;
}

const availableClubs = [
  { id: '1', name: 'ASC Jaraaf', city: 'Dakar' },
  { id: '2', name: 'Casa Sports', city: 'Ziguinchor' },
  { id: '3', name: 'US Gorée', city: 'Gorée' },
  { id: '4', name: 'Génération Foot', city: 'Déni Birame Ndao' },
  { id: '5', name: 'Diambars FC', city: 'Saly' }
];

export default function ChangeClubModal({ isOpen, onClose, onTransfer, childName, currentClub }: ChangeClubModalProps) {
  const [selectedClub, setSelectedClub] = useState('');

  if (!isOpen) return null;

  const handleTransfer = () => {
    if (selectedClub) {
      onTransfer(selectedClub);
      setSelectedClub('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="relative p-6 border-b border-gray-100">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">Changer de club</h2>
          <p className="text-gray-600">Enfant: {childName}</p>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="font-medium text-gray-900">{currentClub}</div>
                <div className="text-sm text-gray-500">Club actuel</div>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400" />
              <div className="text-center">
                <div className="font-medium text-[#4FBA73]">Nouveau club</div>
                <div className="text-sm text-gray-500">À sélectionner</div>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <label className="block text-sm font-medium text-gray-700">Sélectionner le nouveau club</label>
            {availableClubs.filter(club => club.name !== currentClub).map((club) => (
              <label key={club.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="club"
                  value={club.id}
                  checked={selectedClub === club.id}
                  onChange={(e) => setSelectedClub(e.target.value)}
                  className="mr-3 text-[#4FBA73] focus:ring-[#4FBA73]"
                />
                <div>
                  <div className="font-medium">{club.name}</div>
                  <div className="text-sm text-gray-500">{club.city}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleTransfer}
              disabled={!selectedClub}
              className="flex-1 bg-[#4FBA73] hover:bg-[#3da562] text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Transférer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}