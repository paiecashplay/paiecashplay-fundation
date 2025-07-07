'use client';

import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import LoadingSpinner from './LoadingSpinner';

interface DashboardStats {
  enfants_actifs: number;
  clubs_actifs: number;
  donateurs_actifs: number;
  total_dons: number;
  licences_actives: number;
  parrainages_actifs: number;
}

interface TopDonor {
  id: string;
  nom: string;
  prenom: string;
  niveau_donateur: string;
  total_dons: number;
}

export default function WallAndImpact() {
  const impactChartRef = useRef(null);
  const donationChartRef = useRef(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topDonors, setTopDonors] = useState<TopDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    return () => {
      // Cleanup charts
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
      
      // Récupérer les statistiques
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
    // Impact Chart
    if (impactChartRef.current) {
      const ctx = impactChartRef.current.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
          datasets: [{
            label: 'Enfants Soutenus',
            data: [
              Math.floor(data.enfants_actifs * 0.4),
              Math.floor(data.enfants_actifs * 0.55),
              Math.floor(data.enfants_actifs * 0.7),
              Math.floor(data.enfants_actifs * 0.8),
              Math.floor(data.enfants_actifs * 0.9),
              data.enfants_actifs
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

    // Donation Distribution Chart
    if (donationChartRef.current) {
      const ctx = donationChartRef.current.getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: [
            'License Solidaire',
            'Champion Equipment',
            'Daily Energy',
            'Talent Journey',
            'Tomorrow\'s Training'
          ],
          datasets: [{
            data: [35, 25, 20, 12, 8],
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

  const getInitials = (nom: string, prenom: string) => {
    return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
  };

  const getLevelColor = (niveau: string) => {
    switch (niveau) {
      case 'Platine': return { bg: 'from-yellow-100 to-yellow-200', circle: 'bg-yellow-500', text: 'text-yellow-600' };
      case 'Or': return { bg: 'from-gray-100 to-gray-200', circle: 'bg-gray-500', text: 'text-gray-600' };
      case 'Argent': return { bg: 'from-orange-100 to-orange-200', circle: 'bg-orange-500', text: 'text-orange-600' };
      default: return { bg: 'from-red-100 to-red-200', circle: 'bg-red-500', text: 'text-red-600' };
    }
  };

  return (
    <>
      {/* Wall of Champions */}
      <section className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-4">Mur des Champions</h3>
        <p className="text-lg text-gray-600 text-center mb-12">
          Célébrons nos généreux supporters qui font vivre les rêves
        </p>

        <div className="grid lg:grid-cols-4 gap-6">
          {topDonors.map((donor) => {
            const colors = getLevelColor(donor.niveau_donateur);
            return (
              <div key={donor.id} className={`bg-gradient-to-br ${colors.bg} p-6 rounded-xl text-center`}>
                <div className={`w-16 h-16 ${colors.circle} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-white font-bold text-xl">
                    {getInitials(donor.nom, donor.prenom)}
                  </span>
                </div>
                <h4 className="font-bold text-lg">{donor.prenom} {donor.nom?.charAt(0)}.</h4>
                <p className={`${colors.text} font-medium`}>Champion {donor.niveau_donateur}</p>
                <p className="text-sm text-gray-600 mt-2">€{donor.total_dons} donnés</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Impact Chart */}
      <section className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-4">Suivi d'Impact Transparent</h3>
        <p className="text-lg text-gray-600 text-center mb-12">
          Voyez exactement comment vos dons font la différence
        </p>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Impact Growth Chart */}
          <div className="bg-white p-6 rounded-xl shadow-lg h-[350px]">
            <h4 className="text-xl font-bold mb-4">Croissance de l'Impact Mensuel</h4>
            <div className="relative h-[calc(100%-2rem)]">
              <canvas ref={impactChartRef} className="w-full h-full" />
            </div>
          </div>

          {/* Donation Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-lg h-[350px]">
            <h4 className="text-xl font-bold mb-4">Répartition des Dons</h4>
            <div className="relative h-[calc(100%-2rem)]">
              <canvas ref={donationChartRef} className="w-full h-full" />
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mt-12 text-center">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-[#4FBA73]">{stats.enfants_actifs}</div>
              <div className="text-gray-600">Enfants Soutenus</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-blue-600">{stats.clubs_actifs}</div>
              <div className="text-gray-600">Clubs Partenaires</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-purple-600">€{Math.round(stats.total_dons)}</div>
              <div className="text-gray-600">Total Collecté</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-yellow-600">{stats.donateurs_actifs}</div>
              <div className="text-gray-600">Donateurs Actifs</div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}