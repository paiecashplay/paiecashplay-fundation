'use client';

import { useState } from 'react';
import { Search, Users, MapPin, Globe } from 'lucide-react';
import Link from 'next/link';
import AdminNavbar from '@/components/admin/AdminNavbar';

const federationsData = [
  {
    zone: 'ZONE OUEST A (WAFU A)',
    countries: [
      { flag: '🇸🇳', name: 'SÉNÉGAL', federation: 'FSF', languages: 'FR, WO', clubs: 45, children: 892, special: 'Dakar 2026' },
      { flag: '🇲🇦', name: 'MAROC', federation: 'FRMF', languages: 'AR, FR, BER', clubs: 67, children: 1234 },
      { flag: '🇲🇱', name: 'MALI', federation: 'FEMAFOOT', languages: 'FR, BM', clubs: 34, children: 567 },
      { flag: '🇧🇫', name: 'BURKINA FASO', federation: 'FBF', languages: 'FR, MO', clubs: 28, children: 423 },
      { flag: '🇬🇼', name: 'GUINÉE-BISSAU', federation: 'FGF', languages: 'PT, CR', clubs: 15, children: 234 },
      { flag: '🇬🇳', name: 'GUINÉE', federation: 'FGF', languages: 'FR, FF, MN', clubs: 32, children: 456 },
      { flag: '🇨🇻', name: 'CAP-VERT', federation: 'FCF', languages: 'PT, CR', clubs: 12, children: 189 },
      { flag: '🇲🇷', name: 'MAURITANIE', federation: 'FFRIM', languages: 'AR, FR, WO', clubs: 18, children: 267 }
    ]
  },
  {
    zone: 'ZONE OUEST B (WAFU B)',
    countries: [
      { flag: '🇳🇬', name: 'NIGÉRIA', federation: 'NFF', languages: 'EN, HA, YO, IG', clubs: 156, children: 2847 },
      { flag: '🇬🇭', name: 'GHANA', federation: 'GFA', languages: 'EN, AK, EW', clubs: 89, children: 1456 },
      { flag: '🇨🇮', name: 'CÔTE D\'IVOIRE', federation: 'FIF', languages: 'FR, DY, BA', clubs: 78, children: 1234 },
      { flag: '🇱🇷', name: 'LIBÉRIA', federation: 'LFA', languages: 'EN', clubs: 23, children: 345 },
      { flag: '🇸🇱', name: 'SIERRA LEONE', federation: 'SLFA', languages: 'EN, KR, TM', clubs: 19, children: 298 },
      { flag: '🇹🇬', name: 'TOGO', federation: 'FTF', languages: 'FR, EW, KA', clubs: 25, children: 387 },
      { flag: '🇧🇯', name: 'BÉNIN', federation: 'FBF', languages: 'FR, YO, FO', clubs: 21, children: 312 },
      { flag: '🇳🇪', name: 'NIGER', federation: 'FENIFOOT', languages: 'FR, HA, ZA', clubs: 16, children: 245 }
    ]
  },
  {
    zone: 'ZONE CENTRALE (UNIFFAC)',
    countries: [
      { flag: '🇨🇩', name: 'RD CONGO', federation: 'FECOFA', languages: 'FR, LN, SW, KI', clubs: 98, children: 1789 },
      { flag: '🇨🇲', name: 'CAMEROUN', federation: 'FECAFOOT', languages: 'FR, EN, FF', clubs: 87, children: 1567 },
      { flag: '🇬🇦', name: 'GABON', federation: 'FEGAFOOT', languages: 'FR, FG', clubs: 34, children: 456 },
      { flag: '🇨🇫', name: 'CENTRAFRIQUE', federation: 'FCF', languages: 'FR, SG', clubs: 19, children: 234 },
      { flag: '🇹🇩', name: 'TCHAD', federation: 'FTFA', languages: 'FR, AR, SA', clubs: 22, children: 298 },
      { flag: '🇨🇬', name: 'CONGO', federation: 'FECOFOOT', languages: 'FR, LN, KI', clubs: 28, children: 367 },
      { flag: '🇬🇶', name: 'GUINÉE ÉQUATORIALE', federation: 'FEGUIFUT', languages: 'ES, FR, PT', clubs: 14, children: 187 },
      { flag: '🇸🇹', name: 'SAO TOMÉ-ET-PRINCIPE', federation: 'FSTP', languages: 'PT', clubs: 8, children: 123 }
    ]
  },
  {
    zone: 'ZONE EST (CECAFA)',
    countries: [
      { flag: '🇰🇪', name: 'KENYA', federation: 'FKF', languages: 'EN, SW, KI', clubs: 76, children: 1234 },
      { flag: '🇹🇿', name: 'TANZANIE', federation: 'TFF', languages: 'EN, SW', clubs: 65, children: 1098 },
      { flag: '🇺🇬', name: 'OUGANDA', federation: 'FUFA', languages: 'EN, LG, SW', clubs: 54, children: 876 },
      { flag: '🇪🇹', name: 'ÉTHIOPIE', federation: 'EFF', languages: 'AM, OR, TI, EN', clubs: 43, children: 654 },
      { flag: '🇷🇼', name: 'RWANDA', federation: 'FERWAFA', languages: 'RW, EN, FR', clubs: 32, children: 487 },
      { flag: '🇧🇮', name: 'BURUNDI', federation: 'FFB', languages: 'RN, FR, SW', clubs: 28, children: 398 },
      { flag: '🇸🇸', name: 'SOUDAN DU SUD', federation: 'SSFA', languages: 'EN, AR', clubs: 15, children: 234 },
      { flag: '🇩🇯', name: 'DJIBOUTI', federation: 'FDF', languages: 'FR, AR, SO', clubs: 12, children: 178 },
      { flag: '🇸🇴', name: 'SOMALIE', federation: 'SFF', languages: 'SO, AR, EN', clubs: 18, children: 267 },
      { flag: '🇪🇷', name: 'ÉRYTHRÉE', federation: 'EFF', languages: 'TI, AR, EN', clubs: 14, children: 198 },
      { flag: '🇸🇨', name: 'SEYCHELLES', federation: 'SFF', languages: 'EN, FR, CR', clubs: 6, children: 89 }
    ]
  },
  {
    zone: 'ZONE AUSTRALE (COSAFA)',
    countries: [
      { flag: '🇿🇦', name: 'AFRIQUE DU SUD', federation: 'SAFA', languages: 'EN, AF, ZU, XH', clubs: 124, children: 2156 },
      { flag: '🇿🇼', name: 'ZIMBABWE', federation: 'ZIFA', languages: 'EN, SN, ND', clubs: 67, children: 987 },
      { flag: '🇿🇲', name: 'ZAMBIE', federation: 'FAZ', languages: 'EN, BM, NY', clubs: 54, children: 798 },
      { flag: '🇧🇼', name: 'BOTSWANA', federation: 'BFA', languages: 'EN, TN, KK', clubs: 32, children: 456 },
      { flag: '🇳🇦', name: 'NAMIBIE', federation: 'NFA', languages: 'EN, AF, DE', clubs: 28, children: 387 },
      { flag: '🇦🇴', name: 'ANGOLA', federation: 'FAF', languages: 'PT, UM, KM', clubs: 45, children: 623 },
      { flag: '🇲🇿', name: 'MOZAMBIQUE', federation: 'FMF', languages: 'PT, MA, TS', clubs: 38, children: 534 },
      { flag: '🇲🇼', name: 'MALAWI', federation: 'FAM', languages: 'EN, NY, YA', clubs: 29, children: 412 },
      { flag: '🇸🇿', name: 'ESWATINI', federation: 'EFA', languages: 'EN, SS', clubs: 18, children: 267 },
      { flag: '🇱🇸', name: 'LESOTHO', federation: 'LEFA', languages: 'EN, ST', clubs: 15, children: 198 },
      { flag: '🇲🇺', name: 'MAURICE', federation: 'MFA', languages: 'EN, FR, CR', clubs: 12, children: 156 },
      { flag: '🇲🇬', name: 'MADAGASCAR', federation: 'FMF', languages: 'MG, FR', clubs: 34, children: 478 },
      { flag: '🇰🇲', name: 'COMORES', federation: 'FFC', languages: 'AR, FR, SW', clubs: 9, children: 123 },
      { flag: '🇷🇪', name: 'RÉUNION', federation: 'LRF', languages: 'FR, CR', clubs: 16, children: 234 }
    ]
  },
  {
    zone: 'ZONE NORD (UNAF)',
    countries: [
      { flag: '🇪🇬', name: 'ÉGYPTE', federation: 'EFA', languages: 'AR, EN', clubs: 89, children: 1456 },
      { flag: '🇹🇳', name: 'TUNISIE', federation: 'FTF', languages: 'AR, FR', clubs: 67, children: 1098 },
      { flag: '🇩🇿', name: 'ALGÉRIE', federation: 'FAF', languages: 'AR, FR, BER', clubs: 78, children: 1234 },
      { flag: '🇸🇩', name: 'SOUDAN', federation: 'SFA', languages: 'AR, EN', clubs: 54, children: 798 },
      { flag: '🇱🇾', name: 'LIBYE', federation: 'LFF', languages: 'AR, BER', clubs: 43, children: 623 }
    ]
  }
];

export default function FederationsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4FBA73]/10 to-[#3da562]/10">
      <AdminNavbar />
      <header className="bg-gradient-to-r from-[#4FBA73] to-[#3da562] text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Globe className="text-[#4FBA73] text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Back-Office Fédérations</h1>
                <p className="text-sm opacity-90">Gestion des 54 Fédérations Africaines CAF</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-[#4FBA73]">54</div>
            <div className="text-gray-600">Fédérations CAF</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-blue-600">847</div>
            <div className="text-gray-600">Clubs Affiliés</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-purple-600">12,847</div>
            <div className="text-gray-600">Enfants Inscrits</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-yellow-600">€2.1M</div>
            <div className="text-gray-600">Dons Collectés</div>
          </div>
        </section>

        <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une fédération ou un pays..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73] outline-none"
            />
          </div>
        </div>

        {federationsData.map((zone, zoneIndex) => (
          <section key={zoneIndex} className="mb-12">
            <div className="bg-gradient-to-r from-[#4FBA73] to-[#3da562] text-white p-4 rounded-lg mb-6">
              <h3 className="text-xl font-bold">🔸 {zone.zone} - {zone.countries.length} Pays</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {zone.countries.map((country, countryIndex) => (
                <Link href={`/admin/federations/${country.name.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')}`} key={countryIndex}>
                  <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">{country.flag}</span>
                    <div>
                      <h4 className="font-bold text-lg">{country.name}</h4>
                      <p className="text-sm text-gray-600">{country.federation}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="w-4 h-4 mr-2" />
                      <span>{country.languages}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{country.clubs} clubs</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{country.children} enfants</span>
                    </div>
                  </div>
                  
                  {country.special && (
                    <div className="mb-4">
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        {country.special}
                      </span>
                    </div>
                  )}
                  
                    <button className="w-full bg-[#4FBA73] hover:bg-[#3da562] text-white py-2 px-4 rounded-lg font-medium transition-colors">
                      Gérer la fédération
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}