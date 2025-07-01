'use client';

import { X, Download, QrCode, Trophy } from 'lucide-react';

interface Child {
  id: number;
  name: string;
  age: number;
  position: string;
  hasLicense: boolean;
  photo: string;
  joinDate: string;
  sponsor: string | null;
}

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: Child | null;
  clubName: string;
  country: string;
  federation: string;
  flag: string;
}

export default function LicenseModal({ isOpen, onClose, child, clubName, country, federation, flag }: LicenseModalProps) {
  if (!isOpen || !child || !child.hasLicense) return null;

  const licenseNumber = `${federation}2025${String(child.id).padStart(6, '0')}`;
  const birthDate = new Date(Date.now() - child.age * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR');
  const licenseType = child.sponsor ? 'Solidaire' : 'Standard';

  const handleDownload = () => {
    // Simulation du téléchargement
    const element = document.createElement('a');
    const file = new Blob([`Licence ${child.name} - ${licenseNumber}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `licence-${child.name.replace(/\s+/g, '-').toLowerCase()}-${licenseNumber}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="relative p-4 border-b border-gray-100">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">Licence Officielle</h2>
        </div>

        <div className="p-4">
          {/* License Card */}
          <div className="bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] text-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <Trophy className="text-yellow-400 mr-2 w-5 h-5" />
                <span className="font-bold">PAIECASHPLAY</span>
              </div>
              <span className="text-sm">SAISON 2025-2026</span>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-2">{flag}</span>
                <span className="text-sm">FÉDÉRATION {country.toUpperCase()}</span>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded flex items-center justify-center">
                <QrCode className="text-white w-6 h-6" />
              </div>
            </div>
            
            <div className="border-t border-white border-opacity-30 pt-4 mb-4">
              <h5 className="font-bold text-lg mb-2">📋 LICENCE {federation}</h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm opacity-75">👤 {child.position}</p>
                  <p className="font-bold">{child.name.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm opacity-75">📅 NÉ(E) LE</p>
                  <p className="font-bold">{birthDate}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm opacity-75">⚽ CLUB</p>
                <p className="font-bold">{clubName.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm opacity-75">📊 N° LICENCE</p>
                <p className="font-bold">{licenseNumber}</p>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded p-3 mb-4">
              <p className="text-center text-sm">🌍 COUPE DU MONDE 2026 - ÉLIMINATOIRES</p>
            </div>
            
            <div className="text-center">
              <p className="text-sm opacity-75">💳 Sponsorisé par PaieCashPlay</p>
              <p className="text-xs">
                {licenseType === 'Solidaire' ? '💫 Licence Solidaire - Don pour enfants' : '⚽ Licence Standard FIFA'}
              </p>
            </div>
          </div>

          {/* License Info */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Informations de la licence</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type de licence</span>
                <span className={`font-medium ${licenseType === 'Solidaire' ? 'text-[#4FBA73]' : 'text-blue-600'}`}>
                  {licenseType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date d'émission</span>
                <span className="font-medium">{new Date(child.joinDate).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Validité</span>
                <span className="font-medium">30/06/2025</span>
              </div>
              {child.sponsor && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Parrain</span>
                  <span className="font-medium text-[#4FBA73]">{child.sponsor}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
            >
              Fermer
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 bg-[#4FBA73] hover:bg-[#3da562] text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}