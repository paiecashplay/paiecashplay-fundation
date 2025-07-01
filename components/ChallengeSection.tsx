// components/ChallengeSection.jsx
import { getLicenseStats } from '@/lib/licenseData';

interface ChallengeSectionProps {
  onOpenChampionModal: () => void;
}

export default function ChallengeSection({ onOpenChampionModal }: ChallengeSectionProps) {
  const stats = getLicenseStats();
  const current = stats.championEquipment;
  const goal = 100;
  const progressPercent = (current / goal) * 100;

  return (
    <section className="mb-16">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-8 text-center max-w-lg mx-auto">
        <h3 className="text-2xl font-bold mb-4">Défi de ce Mois : Équiper 100 Enfants</h3>
        <p className="text-sm opacity-90 mb-4">Pack "Champion Equipment" attribué</p>

        <div className="mb-6">
          <div className="text-4xl font-bold mb-2">
            {current} / {goal}
          </div>
          <div className="progress-bar mx-auto max-w-md bg-white bg-opacity-30 rounded-full h-6 overflow-hidden">
            <div
              className="progress-fill bg-white h-6 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <p className="text-lg mb-6">
          Plus que {goal - current} enfant{goal - current > 1 ? 's' : ''} à équiper pour atteindre notre
          objectif !
        </p>

        <button 
          onClick={onOpenChampionModal}
          className="bg-white text-orange-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
        >
          Rejoindre le Défi
        </button>
      </div>
    </section>
  );
}
