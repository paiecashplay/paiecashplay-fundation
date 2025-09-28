'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Heart, TrendingUp, Calendar, User, Euro, Gift } from 'lucide-react';
import Link from 'next/link';

interface DonationStats {
  totalDonne: number;
  nombreDons: number;
  nombreEnfants: number;
  dernierDon: string;
}

interface Parrainage {
  id: string;
  joueur: {
    id: number;
    prenom: string;
    nom: string;
    photo_emoji: string;
    club_nom: string;
    pays_nom: string;
  };
  total_donne: number;
  nombre_dons: number;
  date_premier_don: string;
  date_dernier_don: string;
  donations: Array<{
    id: string;
    montant: number;
    pack_nom: string;
    type_recurrence: string;
    date_paiement: string;
  }>;
}

export default function DonationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [parrainages, setParrainages] = useState<Parrainage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/api/auth/login');
      return;
    }

    loadDonorData();
  }, [user, authLoading]);

  const loadDonorData = async () => {
    try {
      const response = await fetch('/api/donations/donor');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setParrainages(data.parrainages);
      }
    } catch (error) {
      console.error('Erreur chargement données donateur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4FBA73]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mon Dashboard Donateur</h1>
              <p className="text-gray-600 mt-2">Suivez l'impact de vos donations</p>
            </div>
            <Link href="/" className="text-[#4FBA73] hover:text-[#3da562] font-medium">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#4FBA73]/10 rounded-lg flex items-center justify-center">
                  <Euro className="w-6 h-6 text-[#4FBA73]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total donné</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDonne}€</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Gift className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Nombre de dons</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.nombreDons}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Enfants soutenus</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.nombreEnfants}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Dernier don</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(stats.dernierDon).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Parrainages */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Mes Parrainages</h2>
          
          {parrainages.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun parrainage pour le moment</h3>
              <p className="text-gray-600 mb-6">Commencez à soutenir des enfants dès maintenant</p>
              <Link href="/#donation-packs" className="bg-[#4FBA73] text-white px-6 py-3 rounded-lg hover:bg-[#3da562] transition-colors">
                Faire un don
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {parrainages.map((parrainage) => (
                <div key={parrainage.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="text-4xl">{parrainage.joueur.photo_emoji}</span>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {parrainage.joueur.prenom} {parrainage.joueur.nom}
                          </h3>
                          <p className="text-gray-600">{parrainage.joueur.club_nom}</p>
                          <p className="text-sm text-gray-500">{parrainage.joueur.pays_nom}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#4FBA73]">{parrainage.total_donne}€</p>
                        <p className="text-sm text-gray-600">{parrainage.nombre_dons} don(s)</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Historique des dons</h4>
                      <div className="space-y-2">
                        {parrainage.donations.map((donation) => (
                          <div key={donation.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                            <div>
                              <span className="font-medium">{donation.pack_nom}</span>
                              <span className="text-sm text-gray-600 ml-2">
                                ({donation.type_recurrence})
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-[#4FBA73]">{donation.montant}€</span>
                              <div className="text-xs text-gray-500">
                                {new Date(donation.date_paiement).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}