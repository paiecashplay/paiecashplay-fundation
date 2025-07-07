'use client';

import { useState, useEffect } from 'react';
import { Search, Users, MapPin, Globe } from 'lucide-react';
import Link from 'next/link';
import AdminNavbar from '@/components/admin/AdminNavbar';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Federation {
  id: string;
  nom: string;
  nom_complet: string;
  pays_nom: string;
  flag_emoji: string;
  langues: string[];
  clubs_count: number;
  enfants_count: number;
}

interface Zone {
  nom: string;
  federations: Federation[];
}

export default function FederationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total_federations: 0,
    total_clubs: 0,
    total_enfants: 0,
    total_dons: 0
  });

  useEffect(() => {
    fetchFederations();
  }, []);

  const fetchFederations = async () => {
    try {
      setLoading(true);
      const [federationsResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/federations'),
        fetch('/api/stats/dashboard')
      ]);

      const federationsResult = await federationsResponse.json();
      const statsResult = await statsResponse.json();

      if (federationsResult.success) {
        setZones(federationsResult.data);
      } else {
        setError('Erreur lors du chargement des fédérations');
      }

      if (statsResult.success) {
        setStats({
          total_federations: federationsResult.data?.reduce((acc, zone) => acc + zone.federations.length, 0) || 0,
          total_clubs: statsResult.data.clubs_actifs || 0,
          total_enfants: statsResult.data.enfants_actifs || 0,
          total_dons: Math.round(statsResult.data.total_dons || 0)
        });
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur fetch federations:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredZones = zones.map(zone => ({
    ...zone,
    federations: zone.federations.filter(federation =>
      federation.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      federation.pays_nom.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(zone => zone.federations.length > 0);

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
            <div className="text-3xl font-bold text-[#4FBA73]">{stats.total_federations}</div>
            <div className="text-gray-600">Fédérations CAF</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.total_clubs}</div>
            <div className="text-gray-600">Clubs Affiliés</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.total_enfants}</div>
            <div className="text-gray-600">Enfants Inscrits</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-yellow-600">€{stats.total_dons}</div>
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

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Chargement des fédérations..." />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchFederations}
              className="bg-[#4FBA73] text-white px-4 py-2 rounded-lg hover:bg-[#3da562]"
            >
              Réessayer
            </button>
          </div>
        ) : (
          filteredZones.map((zone, zoneIndex) => (
            <section key={zoneIndex} className="mb-12">
              <div className="bg-gradient-to-r from-[#4FBA73] to-[#3da562] text-white p-4 rounded-lg mb-6">
                <h3 className="text-xl font-bold">🔸 {zone.nom} - {zone.federations.length} Pays</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {zone.federations.map((federation) => (
                  <Link href={`/admin/federations/${federation.pays_nom.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')}`} key={federation.id}>
                    <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                      <div className="flex items-center mb-4">
                        <span className="text-3xl mr-3">{federation.flag_emoji}</span>
                        <div>
                          <h4 className="font-bold text-lg">{federation.pays_nom}</h4>
                          <p className="text-sm text-gray-600">{federation.nom}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Globe className="w-4 h-4 mr-2" />
                          <span>{federation.langues?.join(', ')}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{federation.clubs_count || 0} clubs</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          <span>{federation.enfants_count || 0} enfants</span>
                        </div>
                      </div>
                      
                      <button className="w-full bg-[#4FBA73] hover:bg-[#3da562] text-white py-2 px-4 rounded-lg font-medium transition-colors">
                        Gérer la fédération
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}