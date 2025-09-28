'use client';

import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import LoadingSpinner from './LoadingSpinner';
import ChampionModal from './ChampionModal';
import { Trophy, Star, Flame, Award, Crown } from 'lucide-react';
import type { DonationPacksRef } from './DonationPack';

interface DashboardStats {
  total_joueurs_soutenus: number;
  total_licences: number;
  total_donations: number;
  moyenne_par_licence: number;
  packs_populaires: Array<{
    pack_nom: string;
    nombre_donations: number;
    montant_total: number;
  }>;
  donations_recentes: Array<{
    id: string;
    joueur_nom: string;
    pack_nom: string;
    montant: number;
    date: string;
    is_anonymous: boolean;
  }>;
}

interface TopDonor {
  id: string;
  nom: string;
  prenom: string;
  pays: string;
  total_dons: number;
  nombre_donations: number;
  moyenne_don: number;
  pack_prefere: string | null;
  anciennete_jours: number;
  dernier_don: string | null;
  is_recent: boolean;
  badges: string[];
  photo_emoji: string;
}

interface WallAndImpactProps {
  donationPacksRef?: React.RefObject<DonationPacksRef>;
}

export default function WallAndImpact({ donationPacksRef }: WallAndImpactProps) {
  const impactChartRef = useRef<HTMLCanvasElement | null>(null);
  const donationChartRef = useRef<HTMLCanvasElement | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topDonors, setTopDonors] = useState<TopDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChampion, setSelectedChampion] = useState<TopDonor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
    return () => {
      if (impactChartRef.current) {
        Chart.getChart(impactChartRef.current)?.destroy();
      }
      if (donationChartRef.current) {
        Chart.getChart(donationChartRef.current)?.destroy();
      }
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [statsResponse, donorsResponse] = await Promise.all([
        fetch('/api/stats/dashboard'),
        fetch('/api/users/top-donors')
      ]);

      const statsResult = await statsResponse.json();
      const donorsResult = await donorsResponse.json();

      if (statsResult.success) {
        setStats(statsResult.data);
        createCharts(statsResult.data);
      }

      if (donorsResult.success) {
        setTopDonors(donorsResult.data.slice(0, 4));
      }

    } catch (err) {
      setError('Erreur de chargement des données');
      console.error('Erreur fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCharts = (data: DashboardStats) => {
    if (impactChartRef.current) {
      const ctx = impactChartRef.current.getContext('2d');
      if (!ctx) return;
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
          datasets: [{
            label: 'Enfants Soutenus',
            data: [
              Math.floor(data.total_joueurs_soutenus * 0.4),
              Math.floor(data.total_joueurs_soutenus * 0.55),
              Math.floor(data.total_joueurs_soutenus * 0.7),
              Math.floor(data.total_joueurs_soutenus * 0.8),
              Math.floor(data.total_joueurs_soutenus * 0.9),
              data.total_joueurs_soutenus
            ],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }

    if (donationChartRef.current) {
      const ctx = donationChartRef.current.getContext('2d');
      if (!ctx) return;
      
      // Utiliser les vraies données des packs ou des données par défaut
      const packData = data.packs_populaires && data.packs_populaires.length > 0 
        ? data.packs_populaires.slice(0, 5)
        : [
            { pack_nom: 'License Solidaire', nombre_donations: 35 },
            { pack_nom: 'Champion Equipment', nombre_donations: 25 },
            { pack_nom: 'Daily Energy', nombre_donations: 20 },
            { pack_nom: 'Talent Journey', nombre_donations: 12 },
            { pack_nom: 'Tomorrow\'s Training', nombre_donations: 8 }
          ];
      
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: packData.map(pack => pack.pack_nom),
          datasets: [{
            data: packData.map(pack => pack.nombre_donations),
            backgroundColor: [
              '#3b82f6',
              '#ea580c',
              '#10b981',
              '#8b5cf6',
              '#6366f1'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  };

  if (loading) {
    return (
      <section className="mb-16">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Chargement des statistiques..." />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-16">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-[#4FBA73] text-white px-4 py-2 rounded-lg hover:bg-[#3da562]"
          >
            Réessayer
          </button>
        </div>
      </section>
    );
  }

  const getDonorLevel = (totalDons: number) => {
    if (totalDons >= 1000) return { level: 'Platine', bg: 'from-yellow-100 to-yellow-200', circle: 'bg-yellow-500', text: 'text-yellow-600', icon: Crown };
    if (totalDons >= 500) return { level: 'Or', bg: 'from-yellow-50 to-yellow-100', circle: 'bg-yellow-400', text: 'text-yellow-500', icon: Trophy };
    if (totalDons >= 200) return { level: 'Argent', bg: 'from-gray-100 to-gray-200', circle: 'bg-gray-400', text: 'text-gray-600', icon: Award };
    if (totalDons >= 50) return { level: 'Bronze', bg: 'from-orange-100 to-orange-200', circle: 'bg-orange-500', text: 'text-orange-600', icon: Star };
    return { level: 'Supporter', bg: 'from-blue-100 to-blue-200', circle: 'bg-blue-500', text: 'text-blue-600', icon: Star };
  };

  const handleChampionClick = (champion: TopDonor) => {
    setSelectedChampion(champion);
    setIsModalOpen(true);
  };

  const handleFirstDonation = () => {
    // Faire défiler vers la section des packs de donation
    const donationSection = document.getElementById('donation-packs');
    if (donationSection) {
      donationSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'Fidélité': return '🏅';
      case 'Généreux': return '💎';
      case 'Récent': return '🔥';
      case 'Régulier': return '⭐';
      case 'Mécène': return '👑';
      default: return '🎖️';
    }
  };

  return (
    <>
      <section className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-4">Mur des Champions</h3>
        <p className="text-lg text-gray-600 text-center mb-12">
          Célébrons nos généreux supporters qui font vivre les rêves
        </p>

        <div className="grid lg:grid-cols-4 gap-6">
          {topDonors.length === 0 ? (
            <div className="col-span-4 text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-12 w-12 text-yellow-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Le mur des champions vous attend !</h4>
              <p className="text-gray-600 mb-6">Soyez parmi les premiers à soutenir nos jeunes talents</p>
              <button 
                onClick={handleFirstDonation}
                className="bg-gradient-to-r from-[#4FBA73] to-[#3da562] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Faire mon premier don
              </button>
            </div>
          ) : (
            topDonors.map((donor, index) => {
              const levelInfo = getDonorLevel(donor.total_dons);
              const IconComponent = levelInfo.icon;
              return (
                <div 
                  key={donor.id} 
                  className={`bg-gradient-to-br ${levelInfo.bg} p-6 rounded-xl text-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl group animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleChampionClick(donor)}
                >
                  <div className="relative">
                    <div className={`w-16 h-16 ${levelInfo.circle} rounded-full flex items-center justify-center mx-auto mb-4 relative group-hover:shadow-lg transition-shadow duration-300`}>
                      <span className="text-white font-bold text-xl">
                        {donor.photo_emoji}
                      </span>
                      {donor.is_recent && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                          <Flame className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <IconComponent className={`h-6 w-6 ${levelInfo.text} opacity-80`} />
                    </div>
                  </div>
                  
                  <a 
                    href={`/player/${donor.id}`}
                    className="font-bold text-lg group-hover:text-[#4FBA73] transition-colors block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {donor.prenom} {donor.nom?.charAt(0)}.
                  </a>
                  <p className={`${levelInfo.text} font-medium mb-2`}>Champion {levelInfo.level}</p>
                  <p className="text-sm text-gray-600 mb-3">€{donor.total_dons} donnés</p>
                  
                  {/* Badges */}
                  {donor.badges && donor.badges.length > 0 && (
                    <div className="flex justify-center flex-wrap gap-1 mb-2">
                      {donor.badges.slice(0, 2).map((badge, badgeIndex) => (
                        <span 
                          key={badgeIndex}
                          className="text-xs bg-white bg-opacity-70 px-2 py-1 rounded-full flex items-center"
                          title={badge}
                        >
                          <span className="mr-1">{getBadgeIcon(badge)}</span>
                          {badge}
                        </span>
                      ))}
                      {donor.badges.length > 2 && (
                        <span className="text-xs bg-white bg-opacity-70 px-2 py-1 rounded-full">
                          +{donor.badges.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Cliquez pour plus de détails
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-4">Suivi d&apos;Impact Transparent</h3>
        <p className="text-lg text-gray-600 text-center mb-12">
          Voyez exactement comment vos dons font la différence
        </p>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-lg h-[350px]">
            <h4 className="text-xl font-bold mb-4">Croissance de l&apos;Impact Mensuel</h4>
            <div className="relative h-[calc(100%-2rem)]">
              <canvas ref={impactChartRef} className="w-full h-full" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg h-[350px]">
            <h4 className="text-xl font-bold mb-4">Répartition des Dons</h4>
            <div className="relative h-[calc(100%-2rem)]">
              <canvas ref={donationChartRef} className="w-full h-full" />
            </div>
          </div>
        </div>

        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mt-12 text-center">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-[#4FBA73]">{stats.total_joueurs_soutenus}</div>
              <div className="text-gray-600">Enfants Soutenus</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-blue-600">{stats.total_licences}</div>
              <div className="text-gray-600">Licences Actives</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-purple-600">€{Math.round(stats.total_donations)}</div>
              <div className="text-gray-600">Total Collecté</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-yellow-600">€{Math.round(stats.moyenne_par_licence)}</div>
              <div className="text-gray-600">Moyenne/Don</div>
            </div>
          </div>
        )}
      </section>
      
      <ChampionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedChampion(null);
        }}
        champion={selectedChampion}
      />
    </>
  );
}