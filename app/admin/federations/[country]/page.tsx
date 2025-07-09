'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Users, MapPin, Heart, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import AddClubModal from '@/components/admin/AddClubModal';
import DeleteClubModal from '@/components/admin/DeleteClubModal';
import AdminNavbar from '@/components/admin/AdminNavbar';

//Création d'un typage pour éviter les erreurs typescript lors de la compilation
type Club = {
  id: number;
  name: string;
  city: string;
  children: number;
  needsLicense: number;
  totalDonations: number;
};

type CountryData = {
  flag: string;
  name: string;
  federation: string;
  clubs: Club[];
};

// 👇 Typage dynamique autorisé
const clubsData: Record<string, CountryData> = {
  senegal: {
    flag: '🇸🇳',
    name: 'SÉNÉGAL',
    federation: 'FSF',
    clubs: [
      { id: 1, name: 'ASC Jaraaf', city: 'Dakar', children: 45, needsLicense: 12, totalDonations: 2400 },
      { id: 2, name: 'Casa Sports', city: 'Ziguinchor', children: 38, needsLicense: 8, totalDonations: 1900 },
      { id: 3, name: 'US Gorée', city: 'Gorée', children: 29, needsLicense: 15, totalDonations: 1450 },
    ],
  },
  maroc: {
    flag: '🇲🇦',
    name: 'MAROC',
    federation: 'FRMF',
    clubs: [
      { id: 1, name: 'Raja Casablanca', city: 'Casablanca', children: 67, needsLicense: 23, totalDonations: 3350 },
      { id: 2, name: 'Wydad AC', city: 'Casablanca', children: 54, needsLicense: 18, totalDonations: 2700 },
    ],
  },
  nigeria: {
    flag: '🇳🇬',
    name: 'NIGÉRIA',
    federation: 'NFF',
    clubs: [
      { id: 1, name: 'Kano Pillars', city: 'Kano', children: 67, needsLicense: 23, totalDonations: 3350 },
      { id: 2, name: 'Enyimba FC', city: 'Aba', children: 54, needsLicense: 18, totalDonations: 2700 },
    ],
  },
};
// const clubsData = {
//   'senegal': {
//     flag: '🇸🇳',
//     name: 'SÉNÉGAL',
//     federation: 'FSF',
//     clubs: [
//       { 
//         id: 1, 
//         name: 'ASC Jaraaf', 
//         city: 'Dakar', 
//         children: 45,
//         needsLicense: 12,
//         totalDonations: 2400
//       },
//       { 
//         id: 2, 
//         name: 'Casa Sports', 
//         city: 'Ziguinchor', 
//         children: 38,
//         needsLicense: 8,
//         totalDonations: 1900
//       },
//       { 
//         id: 3, 
//         name: 'US Gorée', 
//         city: 'Gorée', 
//         children: 29,
//         needsLicense: 15,
//         totalDonations: 1450
//       }
//     ]
//   },
//   'maroc': {
//     flag: '🇲🇦',
//     name: 'MAROC',
//     federation: 'FRMF',
//     clubs: [
//       { 
//         id: 1, 
//         name: 'Raja Casablanca', 
//         city: 'Casablanca', 
//         children: 67,
//         needsLicense: 23,
//         totalDonations: 3350
//       },
//       { 
//         id: 2, 
//         name: 'Wydad AC', 
//         city: 'Casablanca', 
//         children: 54,
//         needsLicense: 18,
//         totalDonations: 2700
//       }
//     ]
//   },
//   'nigeria': {

//     flag: '🇳🇬',
//     name: 'NIGÉRIA',
//     federation: 'NFF',
//     clubs: [
//       { 
//         id: 1, 
//         name: 'Kano Pillars', 
//         city: 'Kano', 
//         children: 67,
//         needsLicense: 23,
//         totalDonations: 3350
//       },
//       { 
//         id: 2, 
//         name: 'Enyimba FC', 
//         city: 'Aba', 
//         children: 54,
//         needsLicense: 18,
//         totalDonations: 2700
//       }
//     ]
//   }
// };

export default function CountryPage() {
  const params = useParams();
  const country = params.country as string;
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddClubModal, setShowAddClubModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  
  const countryData = clubsData[country] || clubsData['senegal'] || {
    flag: '🇺🇳',
    name: country?.toUpperCase() || 'PAYS',
    federation: 'FED',
    clubs: [
      { 
        id: 1, 
        name: 'Club Example', 
        city: 'Ville', 
        children: 25,
        needsLicense: 10,
        totalDonations: 1250
      }
    ]
  };
  
  const [clubs, setClubs] = useState(countryData.clubs);
  
  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.city.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddClub = (clubData: any) => {
    setClubs([...clubs, clubData]);
  };
  
  const handleDeleteClub = (clubId: number) => {
    setClubs(clubs.filter(club => club.id !== clubId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4FBA73]/10 to-[#3da562]/10">
      <AdminNavbar />
      <header className="bg-gradient-to-r from-[#4FBA73] to-[#3da562] text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/federations">
                <ArrowLeft className="w-6 h-6 cursor-pointer hover:opacity-80" />
              </Link>
              <span className="text-3xl">{countryData.flag}</span>
              <div>
                <h1 className="text-2xl font-bold">{countryData.name}</h1>
                <p className="text-sm opacity-90">Fédération {countryData.federation}</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-sm"><MapPin className="inline w-4 h-4 mr-2" />{countryData.clubs.length} clubs</span>
              <span className="text-sm"><Users className="inline w-4 h-4 mr-2" />{countryData.clubs.reduce((sum, club) => sum + club.children, 0)} enfants</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-[#4FBA73]">{countryData.clubs.length}</div>
            <div className="text-gray-600">Clubs Affiliés</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-blue-600">{countryData.clubs.reduce((sum, club) => sum + club.children, 0)}</div>
            <div className="text-gray-600">Enfants Inscrits</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-red-600">{countryData.clubs.reduce((sum, club) => sum + club.needsLicense, 0)}</div>
            <div className="text-gray-600">Licences Nécessaires</div>
          </div>
        </section>

        <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Clubs de {countryData.name}</h2>
            <button 
              onClick={() => setShowAddClubModal(true)}
              className="bg-[#4FBA73] hover:bg-[#3da562] text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un club</span>
            </button>
          </div>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un club..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => (
              <div key={club.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{club.name}</h3>
                    <p className="text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {club.city}
                    </p>
                  </div>
                  <span className="bg-[#4FBA73]/10 text-[#4FBA73] px-2 py-1 rounded-full text-xs">
                    Actif
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Enfants inscrits</span>
                    <span className="font-semibold">{club.children}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Licences nécessaires</span>
                    <span className="font-semibold text-red-600">{club.needsLicense}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dons reçus</span>
                    <span className="font-semibold text-[#4FBA73]">€{club.totalDonations}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link href={`/admin/federations/${country}/${club.id}`} className="flex-1">
                    <button className="w-full bg-[#4FBA73] hover:bg-[#3da562] text-white py-2 px-4 rounded-lg text-sm transition-colors">
                      Voir enfants
                    </button>
                  </Link>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedClub(club);
                      setShowDeleteModal(true);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Modals */}
        <AddClubModal
          isOpen={showAddClubModal}
          onClose={() => setShowAddClubModal(false)}
          onAdd={handleAddClub}
          countryName={countryData.name}
        />
        
        <DeleteClubModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedClub(null);
          }}
          onDelete={() => {
            if (selectedClub) {
              handleDeleteClub(selectedClub.id);
            }
          }}
          clubName={selectedClub?.name || ''}
          childrenCount={selectedClub?.children || 0}
        />
      </main>
    </div>
  );
}