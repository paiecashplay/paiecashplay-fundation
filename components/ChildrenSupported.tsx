'use client';

import { useState, useEffect } from 'react';
import { faAppleAlt, faIdCard, faTshirt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import LoadingSpinner from './LoadingSpinner';
import { useStatsStore } from '@/lib/stores/statsStore';

interface ChildSupported {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  pays_nom: string;
  photo_emoji: string;
  club_nom: string;
  has_license: boolean;
  total_dons_recus: number;
  nombre_parrains: number;
}

export default function ChildrenSupported() {
  const [children, setChildren] = useState<ChildSupported[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshTrigger } = useStatsStore();

  useEffect(() => {
    fetchSupportedChildren();
  }, [refreshTrigger]);

  const fetchSupportedChildren = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/enfants/supported');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Données reçues:', result);
      
      if (result.success && result.data) {
        setChildren(result.data.slice(0, 3)); // Prendre les 3 premiers
      } else {
        setError('Aucune donnée disponible');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur fetch enfants soutenus:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-4">Visages de l'Avenir</h3>
        <p className="text-lg text-gray-600 text-center mb-12">
          Rencontrez les enfants dont vous transformez la vie
        </p>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Chargement des enfants soutenus..." />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-4">Visages de l'Avenir</h3>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchSupportedChildren}
            className="bg-[#4FBA73] text-white px-4 py-2 rounded-lg hover:bg-[#3da562]"
          >
            Réessayer
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-16">
      <h3 className="text-3xl font-bold text-center mb-4">Visages de l'Avenir</h3>
      <p className="text-lg text-gray-600 text-center mb-12">
        Rencontrez les enfants dont vous transformez la vie
      </p>

      <div className="grid lg:grid-cols-3 gap-8">
        {children.map((child, index) => {
          // Rotation des couleurs et icônes
          const configs = [
            {
              bgGradient: 'from-pink-100 to-purple-100',
              icon: faIdCard,
              iconColor: 'text-blue-600',
              supportersColorBg: 'bg-blue-100',
              supportersColorText: 'text-blue-600',
              circleColor: '#f9a8d4'
            },
            {
              bgGradient: 'from-orange-100 to-red-100',
              icon: faTshirt,
              iconColor: 'text-orange-600',
              supportersColorBg: 'bg-orange-100',
              supportersColorText: 'text-orange-600',
              circleColor: '#fb923c'
            },
            {
              bgGradient: 'from-green-100 to-teal-100',
              icon: faAppleAlt,
              iconColor: 'text-green-600',
              supportersColorBg: 'bg-green-100',
              supportersColorText: 'text-green-600',
              circleColor: '#4ade80'
            }
          ];
          
          const config = configs[index % 3];

          return (
            <Link key={child.id} href={`/player/${child.id}`} className="block">
              <div className="child-card rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className={`bg-gradient-to-br ${config.bgGradient} h-48 flex items-center justify-center`}>
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: config.circleColor }}
                  >
                    <span className="text-2xl">{child.photo_emoji}</span>
                  </div>
                </div>

                <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg hover:text-[#4FBA73] transition-colors">
                      {child.prenom}, {child.age} ans
                    </h4>
                    <p className="text-gray-600">{child.club_nom}, {child.pays_nom}</p>
                  </div>
                  <div className={config.iconColor}>
                    <FontAwesomeIcon icon={config.icon} />
                  </div>
                </div>
                
                <h5 className="font-bold mb-2">Soutenu par la communauté</h5>
                <p className="text-gray-700 text-sm mb-4">
                  Grâce à vos dons, {child.prenom} peut maintenant poursuivre ses rêves et développer son talent !
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {child.total_dons_recus > 0 ? `€${child.total_dons_recus} collectés` : 'Nouveau'}
                  </span>
                  <span className={`${config.supportersColorBg} ${config.supportersColorText} px-3 py-1 rounded-full text-xs`}>
                    {child.nombre_parrains} parrain{child.nombre_parrains !== 1 ? 's' : ''}
                  </span>
                </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}