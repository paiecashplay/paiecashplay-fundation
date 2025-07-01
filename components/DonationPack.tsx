// components/DonationPacks.jsx
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faIdCard, faTshirt, faAppleAlt, faBus, faGraduationCap, faCheck } from '@fortawesome/free-solid-svg-icons';
import DonationModal from './DonationModal';
import CustomDonationModal from './CustomDonationModal';

const donationPacks = [
  {
    id: 'licenseDream',
    title: 'License Solidaire',
    price: '50€/mois',
    description: 'Inscription saison sportive officielle, accès aux installations et coaching support',
    benefits: [
      'Nom et photo de l\'enfant',
      'Mises à jour progrès',
      'Certificat de parrainage digital',
    ],
    icon: faIdCard,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    buttonText: 'Parrainer maintenant',
    buttonBg: 'bg-[#4FBA73]',
    buttonHover: 'hover:bg-[#3da562]',
  },
  {
    id: 'championEquipment',
    title: 'Champion Equipment',
    price: '100€/kit',
    description: 'Kit complet : maillot, short, chaussettes, chaussures, protège-tibias',
    benefits: [
      'Photo avec nouvel équipement',
      'Vidéo de remerciement personnelle',
      'Mention mur des héros',
    ],
    icon: faTshirt,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    buttonText: 'Offrir un kit',
    buttonBg: 'bg-orange-600',
    buttonHover: 'hover:bg-orange-700',
    border: 'border border-orange-300',
  },
  {
    id: 'dailyEnergy',
    title: 'Daily Energy',
    price: '10€/mois',
    description: 'Repas équilibrés et collations énergétiques pour entraînements et matchs',
    benefits: [
      'Rapports d\'impact trimestriels',
      'Mises à jour programme nutrition',
      'Suivi amélioration santé',
    ],
    icon: faAppleAlt,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    buttonText: 'Nourrir les rêves',
    buttonBg: 'bg-[#4FBA73]',
    buttonHover: 'hover:bg-[#3da562]',
  },
  {
    id: 'talentJourney',
    title: 'Talent Journey',
    price: '100€/saison',
    description: 'Transport vers compétitions et tournois hors région locale',
    benefits: [
      'Photos de voyage équipe',
      'Partage résultats compétitions',
      'Histoires expérience tournoi',
    ],
    icon: faBus,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    buttonText: 'Ouvrir la voie',
    buttonBg: 'bg-[#4FBA73]',
    buttonHover: 'hover:bg-[#3da562]',
  },
  {
    id: 'tomorrowsTraining',
    title: 'Tomorrow\'s Training',
    price: '75€/module',
    description: 'Ateliers fair-play, gestion émotions et prévention blessures',
    benefits: [
      'Certificats de participation',
      'Témoignages d\'impact formation',
      'Suivi développement compétences',
    ],
    icon: faGraduationCap,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    buttonText: 'Investir dans les compétences',
    buttonBg: 'bg-[#4FBA73]',
    buttonHover: 'hover:bg-[#3da562]',
  },
];

import { forwardRef, useImperativeHandle } from 'react';

const DonationPacks = forwardRef((props, ref) => {
  const [customAmount, setCustomAmount] = useState('');
  const [customDonationType, setCustomDonationType] = useState('Don unique');
  const [selectedPack, setSelectedPack] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const handlePackClick = (pack) => {
    setSelectedPack(pack);
    setIsModalOpen(true);
  };

  const openChampionModal = () => {
    const championPack = donationPacks.find(pack => pack.id === 'championEquipment');
    if (championPack) {
      handlePackClick(championPack);
    }
  };

  // Exposer la fonction via useImperativeHandle
  useImperativeHandle(ref, () => ({
    openChampionModal
  }));

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPack(null);
  };

  const handleCustomDonate = () => {
    if (customAmount && Number(customAmount) > 0) {
      setIsCustomModalOpen(true);
    } else {
      alert('Veuillez saisir un montant valide pour votre don personnalisé.');
    }
  };

  const handleCloseCustomModal = () => {
    setIsCustomModalOpen(false);
  };

  return (
    <>
      <section id="donation-packs" className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-4">5 Packs de Micro-Sponsoring</h3>
        <p className="text-lg text-gray-600 text-center mb-12">
          Choisissez comment vous voulez soutenir les enfants africains
        </p>

        <div className="grid lg:grid-cols-3 gap-8">
          {donationPacks.map((pack) => (
            <div
              key={pack.id}
              className={`donation-pack p-6 rounded-lg shadow cursor-pointer transition-transform hover:scale-105 ${pack.border ? pack.border : ''}`}
              onClick={() => handlePackClick(pack)}
            >
              <div className="flex items-center mb-4">
                <div className={`${pack.iconBg} w-12 h-12 rounded-full flex items-center justify-center`}>
                  <FontAwesomeIcon className={`${pack.iconColor} text-lg`} icon={pack.icon} />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-lg">{pack.title}</h4>
                  <p className={`${pack.iconColor} font-bold`}>{pack.price}</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{pack.description}</p>
              <ul className="text-sm text-gray-600 mb-6 space-y-2">
                {pack.benefits.map((benefit, i) => (
                  <li key={i}>
                    <FontAwesomeIcon className="text-green-500 mr-2" icon={faCheck} />
                    {benefit}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full text-white py-3 rounded-lg font-medium transition ${pack.buttonBg} ${pack.buttonHover}`}
              >
                {pack.buttonText}
              </button>
            </div>
          ))}

          {/* Custom Support */}
          <div className="donation-pack p-6 border border-gray-300 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#4FBA73] to-[#3da562] rounded-full flex items-center justify-center">
                <i className="fas fa-heart text-white text-lg"></i>
              </div>
              <div className="ml-4">
                <h4 className="font-bold text-lg">Support Personnalisé</h4>
                <p className="text-[#4FBA73] font-bold">Montant libre</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Choisissez votre propre montant pour soutenir la cause à votre façon
            </p>
            <div className="mb-6">
              <input
                type="number"
                min="1"
                placeholder="Entrez votre montant (€)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73] outline-none transition-colors"
              />
              <select
                value={customDonationType}
                onChange={(e) => setCustomDonationType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73] outline-none transition-colors"
              >
                <option>Don unique</option>
                <option>Don mensuel</option>
                <option>Don annuel</option>
              </select>
            </div>
            <button
              onClick={handleCustomDonate}
              className="w-full bg-[#4FBA73] text-white py-3 rounded-lg font-medium hover:bg-[#3da562] transition-colors"
            >
              Faire un don
            </button>
          </div>
        </div>
      </section>

      {/* Modals */}
      <DonationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        pack={selectedPack}
      />
      
      <CustomDonationModal
        isOpen={isCustomModalOpen}
        onClose={handleCloseCustomModal}
        amount={customAmount}
        donationType={customDonationType}
      />
    </>
  );
});

DonationPacks.displayName = 'DonationPacks';

export default DonationPacks;