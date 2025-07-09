'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Users, Calendar, Heart, Award, Search, Filter, Plus, RefreshCw, Eye } from 'lucide-react';
import Link from 'next/link';
import AddChildModal from '@/components/admin/AddChildModal';
import ChangeClubModal from '@/components/admin/ChangeClubModal';
import LicenseModal from '@/components/admin/LicenseModal';
import AdminNavbar from '@/components/admin/AdminNavbar';
import type { ClubData, Child } from './types';


const childrenData: Record<string, ClubData> = {
  '1': {
    clubName: 'ASC Jaraaf',
    city: 'Dakar',
    country: 'SÉNÉGAL',
    children: [
      {
        id: 1,
        name: 'Mamadou Diallo',
        age: 12,
        position: 'Attaquant',
        hasLicense: false,
        needsDonation: true,
        donationAmount: 50,
        photo: '👦🏿',
        joinDate: '2024-01-15',
        sponsor: null,
        country: 'SÉNÉGAL',
        club: 'ASC Jaraaf'
      },
      {
        id: 2,
        name: 'Fatou Sall',
        age: 10,
        position: 'Milieu',
        hasLicense: true,
        needsDonation: false,
        donationAmount: 0,
        photo: '👧🏿',
        joinDate: '2023-09-20',
        sponsor: 'Pierre Ferracci',
        country: 'SÉNÉGAL',
        club: 'ASC Jaraaf'
      },
      {
        id: 3,
        name: 'Ousmane Ba',
        age: 14,
        position: 'Défenseur',
        hasLicense: false,
        needsDonation: true,
        donationAmount: 50,
        photo: '👦🏿',
        joinDate: '2024-02-10',
        sponsor: null,
        country: 'SÉNÉGAL',
        club: 'ASC Jaraaf'
      }
    ]
  }
};

export default function ClubChildrenPage() {
  const params = useParams();
  const { country, clubId } = params;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChangeClubModal, setShowChangeClubModal] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  
  const clubData = childrenData[clubId as string] || childrenData['1'];
  const [children, setChildren] = useState(clubData.children);
  
  const filteredChildren = children.filter(child => {
    const matchesSearch = child.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'needs-license' && !child.hasLicense) ||
      (filterStatus === 'sponsored' && child.sponsor) ||
      (filterStatus === 'needs-sponsor' && !child.sponsor);
    
    return matchesSearch && matchesFilter;
  });

  const handleAddChild = (childData: any) => {
    setChildren([...children, childData]);
  };

  const handleChangeClub = (childId: number, newClubId: string) => {
    const clubs = ['ASC Jaraaf', 'Casa Sports', 'US Gorée', 'Génération Foot', 'Diambars FC'];
    const newClubName = clubs[parseInt(newClubId) - 1] || 'Nouveau Club';
    alert(`${selectedChild?.name} transféré vers ${newClubName}`);
    setShowChangeClubModal(false);
    setSelectedChild(null);
  };

  const handleAssignLicense = (childId: number) => {
    alert(`Attribution de licence pour l'enfant ID: ${childId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4FBA73]/10 to-[#3da562]/10">
      <AdminNavbar />
      <header className="bg-gradient-to-r from-[#4FBA73] to-[#3da562] text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/admin/federations/${country}`}>
                <ArrowLeft className="w-6 h-6 cursor-pointer hover:opacity-80" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{clubData.clubName}</h1>
                <p className="text-sm opacity-90">{clubData.city}, {clubData.country}</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-sm"><Users className="inline w-4 h-4 mr-2" />{clubData.children.length} enfants</span>
              <span className="text-sm"><Award className="inline w-4 h-4 mr-2" />{clubData.children.filter(c => c.hasLicense).length} licenciés</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-[#4FBA73]">{clubData.children.length}</div>
            <div className="text-gray-600">Total Enfants</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-blue-600">{clubData.children.filter(c => c.hasLicense).length}</div>
            <div className="text-gray-600">Avec Licence</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-red-600">{clubData.children.filter(c => !c.hasLicense).length}</div>
            <div className="text-gray-600">Sans Licence</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-purple-600">{clubData.children.filter(c => c.sponsor).length}</div>
            <div className="text-gray-600">Parrainés</div>
          </div>
        </section>

        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Liste des Enfants</h2>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-[#4FBA73] hover:bg-[#3da562] text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un enfant</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un enfant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73] outline-none"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73] outline-none"
            >
              <option value="all">Tous les enfants</option>
              <option value="needs-license">Sans licence</option>
              <option value="sponsored">Parrainés</option>
              <option value="needs-sponsor">Sans parrain</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChildren.map((child) => (
              <div key={child.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl mr-4">
                    {child.photo}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{child.name}</h3>
                    <p className="text-gray-600">{child.age} ans • {child.position}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Statut licence</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${child.hasLicense ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {child.hasLicense ? 'Licencié' : 'Sans licence'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Parrain</span>
                    <span className={`text-sm ${child.sponsor ? 'text-[#4FBA73]' : 'text-gray-400'}`}>
                      {child.sponsor || 'Aucun'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inscription</span>
                    <span className="text-sm">{new Date(child.joinDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                  
                  {child.needsDonation && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Don nécessaire</span>
                      <span className="font-semibold text-[#4FBA73]">€{child.donationAmount}</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  {child.hasLicense ? (
                    <button
                      onClick={() => {
                        setSelectedChild(child);
                        setShowLicenseModal(true);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Voir licence</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAssignLicense(child.id)}
                      className="flex-1 bg-[#4FBA73] hover:bg-[#3da562] text-white py-2 px-4 rounded-lg text-sm transition-colors"
                    >
                      Attribuer licence
                    </button>
                  )}
                  
                  {child.needsDonation && (
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button 
                    onClick={() => {
                      setSelectedChild(child);
                      setShowChangeClubModal(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Modals */}
        <AddChildModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddChild}
          clubName={clubData.clubName}
        />
        
        <ChangeClubModal
          isOpen={showChangeClubModal}
          onClose={() => {
            setShowChangeClubModal(false);
            setSelectedChild(null);
          }}
          onTransfer={(newClubId) => {
            if (selectedChild) {
              handleChangeClub(selectedChild.id, newClubId);
            }
          }}
          childName={selectedChild?.name || ''}
          currentClub={clubData.clubName}
        />

        <LicenseModal
          isOpen={showLicenseModal}
          onClose={() => {
            setShowLicenseModal(false);
            setSelectedChild(null);
          }}
          child={selectedChild}
          clubName={clubData.clubName}
          country={clubData.country}
          federation={clubData.country === 'SÉNÉGAL' ? 'FSF' : 'FED'}
          flag={clubData.country === 'SÉNÉGAL' ? '🇸🇳' : '🌍'}
        />
      </main>
    </div>
  );
}