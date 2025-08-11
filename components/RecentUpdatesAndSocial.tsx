'use client';

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faBus, faIdCard, faTshirt, faAppleAlt, faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from './LoadingSpinner';

interface RecentDonation {
  id: string;
  title: string;
  description: string;
  thanks: string;
  timeAgo: string;
  pack_code: string;
  amount: number;
  player_name: string;
  player_country: string;
}


export default function RecentUpdatesAndSocial() {
  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchRecentDonations();
  }, []);

  const fetchRecentDonations = async () => {
    try {
      const response = await fetch('/api/donations/recent');
      const result = await response.json();
      
      if (result.success) {
        setRecentDonations(result.data);
      }
    } catch (error) {
      console.error('Erreur fetch donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPackIcon = (packCode: string): IconProp => {
    switch (packCode) {
      case 'licenseSolidaire': return faIdCard;
      case 'championEquipment': return faTshirt;
      case 'dailyEnergy': return faAppleAlt;
      case 'talentJourney': return faBus;
      case 'tomorrowTraining': return faGraduationCap;
      default: return faIdCard;
    }
  };

  const getPackColors = (packCode: string) => {
    switch (packCode) {
      case 'licenseSolidaire': return { bg: 'bg-blue-100', icon: 'text-blue-600', thanks: 'text-blue-600' };
      case 'championEquipment': return { bg: 'bg-orange-100', icon: 'text-orange-600', thanks: 'text-orange-600' };
      case 'dailyEnergy': return { bg: 'bg-green-100', icon: 'text-green-600', thanks: 'text-green-600' };
      case 'talentJourney': return { bg: 'bg-purple-100', icon: 'text-purple-600', thanks: 'text-purple-600' };
      case 'tomorrowTraining': return { bg: 'bg-indigo-100', icon: 'text-indigo-600', thanks: 'text-indigo-600' };
      default: return { bg: 'bg-gray-100', icon: 'text-gray-600', thanks: 'text-gray-600' };
    }
  };



  return (
    <>
      {/* Recent Updates Feed */}
      <section className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-4">Mises à Jour d'Impact Récentes</h3>
        <p className="text-lg text-gray-600 text-center mb-12">Les dernières nouvelles de nos projets</p>

        <div className="space-y-4 max-w-3xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" text="Chargement des dons récents..." />
            </div>
          ) : recentDonations.length > 0 ? (
            recentDonations.map((donation) => {
              const colors = getPackColors(donation.pack_code);
              return (
                <FeedCard
                  key={donation.id}
                  bgColor={colors.bg}
                  icon={getPackIcon(donation.pack_code)}
                  iconColor={colors.icon}
                  title={donation.title}
                  timeAgo={donation.timeAgo}
                  description={donation.description}
                  thanks={donation.thanks}
                  thanksColor={colors.thanks}
                />
              );
            })
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faIdCard} className="text-gray-400 text-2xl" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Aucun don récent</h4>
              <p className="text-gray-600 mb-4">Les derniers dons apparaîtront ici dès qu'ils seront effectués</p>
              <p className="text-sm text-gray-500">Soyez le premier à faire un don !</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// Sous-composant pour les cartes du feed
type FeedCardProps = {
  bgColor: string;
  icon: IconProp;
  iconColor: string;
  title: string;
  timeAgo: string;
  description: string;
  thanks: string;
  thanksColor: string;
};

function FeedCard({
  bgColor,
  icon,
  iconColor,
  title,
  timeAgo,
  description,
  thanks,
  thanksColor,
}: FeedCardProps) {
  return (
    <div className="feed-card p-6 border border-gray-100 rounded-lg shadow-sm">
      <div className="flex items-start space-x-4">
        <div className={`${bgColor} rounded-full w-12 h-12 flex items-center justify-center text-2xl`}>
          {/* <span className={iconColor}>{icon}</span> */}
            <FontAwesomeIcon icon={icon} className={iconColor}/>

        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold">{title}</h4>
            <span className="text-sm text-gray-500">{timeAgo}</span>
          </div>
          <p className="text-gray-700 mb-2">{description}</p>
          <p className={`${thanksColor} font-medium`}>{thanks}</p>
        </div>
      </div>
    </div>
  );
}


