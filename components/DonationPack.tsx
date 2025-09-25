// components/DonationPacks.tsx
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIdCard, faTshirt, faAppleAlt, faBus, faGraduationCap, faCheck } from '@fortawesome/free-solid-svg-icons';
import DonationModal from './DonationModal';
import CustomDonationModal from './CustomDonationModal';
import LoadingSpinner from './LoadingSpinner';
import type { DonationPack } from '@/types/DonationPack';

export interface DonationPacksRef {
  openChampionModal: () => void;
}

const iconMap: { [key: string]: any } = {
  faIdCard,
  faTshirt,
  faAppleAlt,
  faBus,
  faGraduationCap
};

const DonationPacks = forwardRef<DonationPacksRef, {}>((_, ref) => {
  const [customAmount, setCustomAmount] = useState('');
  const [customDonationType, setCustomDonationType] = useState('Don unique');
  const [selectedPack, setSelectedPack] = useState<DonationPack | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [donationPacks, setDonationPacks] = useState<DonationPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDonationPacks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/donations');
        const result = await response.json();

        if (result.success) {
          setDonationPacks(result.data);
        } else {
          setError('Erreur lors du chargement des packs');
        }
      } catch (err) {
        setError('Erreur de connexion');
        console.error('Erreur fetch packs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonationPacks();
  }, []);

  const handlePackClick = (pack: DonationPack) => {
    setSelectedPack(pack);
    setIsModalOpen(true);
  };

  const openChampionModal = () => {
    const championPack = donationPacks.find(pack => pack.code === 'championEquipment');
    if (championPack) {
      handlePackClick(championPack);
    }
  };

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
        <h3 className="text-3xl font-bold text-center mb-4">Packs de Micro-Sponsoring</h3>
        <p className="text-lg text-gray-600 text-center mb-12">
          Choisissez comment vous voulez soutenir les enfants africains
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Chargement des packs de donation..." />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#4FBA73] text-white px-4 py-2 rounded-lg hover:bg-[#3da562]"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {donationPacks.map((pack) => {
              const icon = iconMap[pack.icone_fa] || faIdCard;
              const priceDisplay = `${pack.prix}€${
                pack.type_recurrence === 'mensuel'
                  ? '/mois'
                  : pack.type_recurrence === 'annuel'
                  ? '/an'
                  : pack.type_recurrence === 'saison'
                  ? '/saison'
                  : ''
              }`;

              return (
                <div
                  key={pack.id}
                  className="donation-pack p-6 rounded-lg shadow cursor-pointer transition-transform hover:scale-105"
                  onClick={() => handlePackClick(pack)}
                  style={{ backgroundColor: pack.couleur_fond }}
                >
                  <div className="flex items-center mb-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: pack.couleur_fond }}
                    >
                      <FontAwesomeIcon className="text-lg" style={{ color: pack.couleur_icone }} icon={icon} />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-lg">{pack.nom}</h4>
                      <p className="font-bold" style={{ color: pack.couleur_icone }}>
                        {priceDisplay}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{pack.description}</p>
                  <ul className="text-sm text-gray-600 mb-6 space-y-2">
                    {(() => {
                      try {
                        const benefits = typeof pack.avantages === 'string'
                          ? JSON.parse(pack.avantages)
                          : pack.avantages || [];
                        return benefits.map((benefit: string, i: number) => (
                          <li key={i}>
                            <FontAwesomeIcon className="text-green-500 mr-2" icon={faCheck} />
                            {benefit}
                          </li>
                        ));
                      } catch (error) {
                        console.error('Erreur parsing avantages:', error);
                        return null;
                      }
                    })()}
                  </ul>
                  <button
                    className="w-full text-white py-3 rounded-lg font-medium transition hover:opacity-90"
                    style={{ backgroundColor: pack.couleur_bouton }}
                  >
                    Sélectionner ce pack
                  </button>
                </div>
              );
            })}

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
        )}
      </section>

      {/* Modals */}
      <DonationModal isOpen={isModalOpen} onClose={handleCloseModal} pack={selectedPack} />
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
