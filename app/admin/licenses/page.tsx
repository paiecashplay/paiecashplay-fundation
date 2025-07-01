'use client';

import { useState } from 'react';
import { Search, Award, User } from 'lucide-react';
import AdminNavbar from '@/components/admin/AdminNavbar';

const licensesData = [
  {
    id: 'SEN2025001234',
    childName: 'Mamadou Diallo',
    club: 'ASC Jaraaf',
    country: 'Sénégal',
    federation: 'FSF',
    issueDate: '2024-01-15',
    expiryDate: '2025-06-30',
    status: 'active',
    type: 'Solidaire',
    sponsor: 'Pierre Ferracci',
    photo: '👦🏿',
    age: 12,
    position: 'Attaquant'
  },
  {
    id: 'SEN2025001235',
    childName: 'Fatou Sall',
    club: 'Casa Sports',
    country: 'Sénégal',
    federation: 'FSF',
    issueDate: '2023-09-20',
    expiryDate: '2025-06-30',
    status: 'active',
    type: 'Standard',
    sponsor: null,
    photo: '👧🏿',
    age: 10,
    position: 'Milieu'
  },
  {
    id: 'MAR2025000456',
    childName: 'Youssef Benali',
    club: 'Raja Casablanca',
    country: 'Maroc',
    federation: 'FRMF',
    issueDate: '2024-02-10',
    expiryDate: '2025-06-30',
    status: 'active',
    type: 'Solidaire',
    sponsor: 'Sarah Martin',
    photo: '👦🏾',
    age: 14,
    position: 'Défenseur'
  },
  {
    id: 'NGA2025000789',
    childName: 'Kemi Adebayo',
    club: 'Kano Pillars',
    country: 'Nigéria',
    federation: 'NFF',
    issueDate: '2024-03-05',
    expiryDate: '2025-06-30',
    status: 'active',
    type: 'Académie',
    sponsor: null,
    photo: '👧🏿',
    age: 11,
    position: 'Gardien'
  },
  {
    id: 'GHA2025000321',
    childName: 'Kwame Asante',
    club: 'Hearts of Oak',
    country: 'Ghana',
    federation: 'GFA',
    issueDate: '2024-01-20',
    expiryDate: '2025-06-30',
    status: 'active',
    type: 'Ambassadeur',
    sponsor: 'Club Sponsor',
    photo: '👦🏿',
    age: 15,
    position: 'Attaquant'
  }
];

export default function LicensesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredLicenses = licensesData.filter(license => {
    const matchesSearch = license.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         license.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || license.type.toLowerCase() === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4FBA73]/10 to-[#3da562]/10">
      <AdminNavbar />
      <header className="bg-gradient-to-r from-[#4FBA73] to-[#3da562] text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Award className="text-[#4FBA73] text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Gestion des Licences</h1>
                <p className="text-sm opacity-90">Système FIFA - Licences Solidaires PaieCashPlay</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-[#4FBA73]">{licensesData.length}</div>
            <div className="text-gray-600">Total Licences</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-blue-600">{licensesData.filter(l => l.status === 'active').length}</div>
            <div className="text-gray-600">Actives</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-purple-600">{licensesData.filter(l => l.type === 'Solidaire').length}</div>
            <div className="text-gray-600">Solidaires</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-yellow-600">{licensesData.filter(l => l.sponsor).length}</div>
            <div className="text-gray-600">Parrainées</div>
          </div>
        </section>

        {/* Types de Licences */}
        <section className="mb-8">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4">🎯 Types de Licences Disponibles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow border-l-4 border-blue-500">
                <h4 className="font-bold text-blue-600 mb-2">🔹 Licence Standard</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Licence officielle fédération</li>
                  <li>• Tous les droits et protections FIFA</li>
                  <li>• Assurance intégrée</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow border-l-4 border-[#4FBA73]">
                <h4 className="font-bold text-[#4FBA73] mb-2">🔹 Licence Solidaire PaieCashPlay ⭐</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Licence standard + don automatique</li>
                  <li>• 10€ reversés aux enfants africains</li>
                  <li>• Badge spécial "Solidaire"</li>
                  <li>• Suivi d'impact personnalisé</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow border-l-4 border-purple-500">
                <h4 className="font-bold text-purple-600 mb-2">🔹 Licence Académie Non-Affiliée</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Pour académies indépendantes</li>
                  <li>• Certification PaieCashPlay</li>
                  <li>• Passerelle vers licence officielle</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow border-l-4 border-yellow-500">
                <h4 className="font-bold text-yellow-600 mb-2">🔹 Licence Ambassadeur</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Pour joueurs influents</li>
                  <li>• Privilèges spéciaux</li>
                  <li>• Impact solidaire amplifié</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Liste des Licenciés</h2>
            <button className="bg-[#4FBA73] hover:bg-[#3da562] text-white px-4 py-2 rounded-lg">
              Nouvelle licence
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou numéro de licence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73] outline-none"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73] outline-none"
            >
              <option value="all">Tous types</option>
              <option value="solidaire">Solidaire</option>
              <option value="standard">Standard</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Enfant</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">N° Licence</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Club</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Parrain</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLicenses.map((license) => (
                  <tr key={license.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                          {license.photo}
                        </div>
                        <div>
                          <div className="font-medium">{license.childName}</div>
                          <div className="text-sm text-gray-500">{license.age} ans • {license.position}</div>
                          <div className="text-xs text-gray-400">{license.country}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-mono text-sm">{license.id}</div>
                      <div className="text-xs text-gray-500">{license.federation}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium">{license.club}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        license.type === 'Solidaire' 
                          ? 'bg-[#4FBA73]/10 text-[#4FBA73]' 
                          : license.type === 'Standard'
                          ? 'bg-blue-100 text-blue-600'
                          : license.type === 'Académie'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {license.type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        {license.sponsor ? (
                          <span className="text-[#4FBA73]">{license.sponsor}</span>
                        ) : (
                          <span className="text-gray-400">Aucun</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          Voir
                        </button>
                        <button className="text-[#4FBA73] hover:text-[#3da562] text-sm">
                          Modifier
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}