'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (childData: any) => void;
  clubName: string;
}

export default function AddChildModal({ isOpen, onClose, onAdd, clubName }: AddChildModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    position: 'Attaquant',
    photo: '👦🏿'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newChild = {
      id: Date.now(),
      name: formData.name,
      age: parseInt(formData.age),
      position: formData.position,
      hasLicense: false,
      needsDonation: true,
      donationAmount: 50,
      photo: formData.photo,
      joinDate: new Date().toISOString().split('T')[0],
      sponsor: null
    };
    onAdd(newChild);
    setFormData({ name: '', age: '', position: 'Attaquant', photo: '👦🏿' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="relative p-6 border-b border-gray-100">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">Ajouter un enfant</h2>
          <p className="text-gray-600">Club: {clubName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Âge</label>
              <input
                type="number"
                required
                min="6"
                max="18"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73] outline-none"
              >
                <option>Attaquant</option>
                <option>Milieu</option>
                <option>Défenseur</option>
                <option>Gardien</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avatar</label>
              <div className="flex space-x-2">
                {['👦🏿', '👧🏿', '👦🏾', '👧🏾'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({...formData, photo: emoji})}
                    className={`text-2xl p-2 rounded-lg border-2 ${formData.photo === emoji ? 'border-[#4FBA73]' : 'border-gray-200'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
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
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}