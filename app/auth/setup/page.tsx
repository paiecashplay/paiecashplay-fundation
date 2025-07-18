'use client';

import { useState } from 'react';
import { Users, Building, Trophy, User } from 'lucide-react';
import Image from 'next/image';

const accountTypes = [
  {
    id: 'normal',
    title: 'Compte Donateur',
    description: 'Pour soutenir les jeunes footballeurs africains',
    icon: User,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  {
    id: 'federation',
    title: 'Compte Fédération',
    description: 'Pour les fédérations nationales de football',
    icon: Building,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  {
    id: 'club',
    title: 'Compte Club',
    description: 'Pour les clubs et académies de football',
    icon: Users,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  {
    id: 'player',
    title: 'Compte Joueur',
    description: 'Pour les jeunes footballeurs (6-18 ans)',
    icon: Trophy,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600'
  }
];

export default function AccountSetupPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTypeSelection = (type: string) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (selectedType) {
      setLoading(true);
      window.location.href = `/auth/setup/${selectedType}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-4">
            <Image 
              src="/logo.png" 
              alt="PaieCashPlay Logo" 
              width={96} 
              height={96}
              className="rounded-full"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finaliser votre compte</h1>
          <p className="text-gray-600">Choisissez le type de compte qui vous correspond</p>
        </div>

        {/* Types de comptes */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {accountTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            
            return (
              <div
                key={type.id}
                onClick={() => handleTypeSelection(type.id)}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? `border-[#4FBA73] ${type.bgColor} shadow-lg scale-105` 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${type.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-2 ${isSelected ? type.textColor : 'text-gray-900'}`}>
                      {type.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {type.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-[#4FBA73] rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bouton continuer */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedType || loading}
            className="bg-gradient-to-r from-[#4FBA73] to-[#3da562] text-white py-4 px-8 rounded-xl font-semibold hover:from-[#3da562] hover:to-[#2d8a4e] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Chargement...</span>
              </div>
            ) : (
              'Continuer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}