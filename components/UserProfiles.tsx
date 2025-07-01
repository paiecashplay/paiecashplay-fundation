import { SetStateAction, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBriefcase, faCalendarAlt, faCashRegister, faHandHoldingHeart, faHeart, faUsers } from '@fortawesome/free-solid-svg-icons';

export default function UserProfiles() {
  const [selectedProfile, setSelectedProfile] = useState(null);

  const profiles = [
    {
      id: 'fan',
      icon: faHeart,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: 'Fan Passionné',
      subtitle: 'Pierre Ferracci - Paris FC',
      description: 'Billetterie, engagement interactif, dons directs, gamification avec badges club',
      tags: [
        { text: 'Billetterie', bg: 'bg-blue-100', color: 'text-blue-600' },
        { text: 'Dons', bg: 'bg-green-100', color: 'text-green-600' },
        { text: 'Gamification', bg: 'bg-purple-100', color: 'text-purple-600' }
      ]
    },
    {
      id: 'partner',
      icon: faBriefcase,
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      title: 'Partenaire Commercial',
      subtitle: 'Solutions B2B',
      description: 'Dashboard B2B, campagnes publicitaires, parrainage solidaire enfants africains',
      tags: [
        { text: 'B2B', bg: 'bg-gray-100', color: 'text-gray-600' },
        { text: 'Parrainage', bg: 'bg-orange-100', color: 'text-orange-600' },
        { text: 'Analytics', bg: 'bg-yellow-100', color: 'text-yellow-600' }
      ]
    },
    {
      id: 'member',
      icon: faUsers,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      title: 'Membre de Club',
      subtitle: 'Communauté',
      description: 'Espace club privé, défis solidaires collectifs, messagerie interne, événements exclusifs',
      tags: [
        { text: 'Communauté', bg: 'bg-purple-100', color: 'text-purple-600' },
        { text: 'Défis', bg: 'bg-green-100', color: 'text-green-600' },
        { text: 'Événements', bg: 'bg-blue-100', color: 'text-blue-600' }
      ]
    },
    {
      id: 'organizer',
      icon: faCalendarAlt,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      title: "Organisateur d'Événement",
      subtitle: 'Gestion Pro',
      description: 'Interface de gestion, événements solidaires avec reversement automatique, billetterie intégrée',
      tags: [
        { text: 'Gestion', bg: 'bg-red-100', color: 'text-red-600' },
        { text: 'Solidaire', bg: 'bg-orange-100', color: 'text-orange-600' },
        { text: 'Billetterie', bg: 'bg-green-100', color: 'text-green-600' }
      ]
    },
    {
      id: 'merchant',
      icon: faCashRegister,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: 'Vendeur/Commerçant',
      subtitle: 'Cashless',
      description: 'Terminal de paiement intégré, arrondi solidaire automatique, gestion des ventes',
      tags: [
        { text: 'Cashless', bg: 'bg-green-100', color: 'text-green-600' },
        { text: 'Arrondi', bg: 'bg-orange-100', color: 'text-orange-600' },
        { text: 'Terminal', bg: 'bg-blue-100', color: 'text-blue-600' }
      ]
    },
    {
      id: 'donor',
      icon: faHandHoldingHeart,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      title: 'Donateur/ONG',
      subtitle: 'Impact Solidaire',
      description: '5 packs de micro-sponsoring, suivi personnalisé des enfants, mur des champions donateurs',
      tags: [
        { text: 'Micro-sponsoring', bg: 'bg-orange-100', color: 'text-orange-600' },
        { text: 'Impact', bg: 'bg-red-100', color: 'text-red-600' },
        { text: 'Suivi', bg: 'bg-yellow-100', color: 'text-yellow-600' }
      ]
    }
  ];

  function selectProfile(id:any) {
    setSelectedProfile(id);
  }

  return (
    <section className="mb-16">
      <h3 className="text-3xl font-bold text-center mb-4">6 Expériences Personnalisées</h3>
      <p className="text-lg text-gray-600 text-center mb-12">Chaque utilisateur dispose de son parcours unique et optimisé</p>

      <div className="profile-selector">
        {profiles.map(profile => (
          <div
            key={profile.id}
            className={`profile-card cursor-pointer p-6 border rounded-lg shadow-sm transition 
              ${selectedProfile === profile.id ? 'border-blue-600 bg-blue-50' : 'border-transparent hover:border-gray-300'}`}
            onClick={() => selectProfile(profile.id)}
          >
            <div className="flex items-center mb-4">
              <div className={`${profile.iconBg} rounded-full w-12 h-12 flex items-center justify-center`}>
                {/* <i className={`${profile.icon} ${profile.iconColor} text-xl`}></i> */}
                <FontAwesomeIcon className={`${profile.iconColor} text-lg`} icon={profile.icon} />
                
              </div>
              <div className="ml-4">
                <h4 className="font-bold text-lg">{profile.title}</h4>
                <p className="text-gray-600 text-sm">{profile.subtitle}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{profile.description}</p>
            <div className="flex space-x-2">
              {profile.tags.map((tag, i) => (
                <span
                  key={i}
                  className={`${tag.bg} ${tag.color} px-3 py-1 rounded-full text-xs`}
                >
                  {tag.text}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
