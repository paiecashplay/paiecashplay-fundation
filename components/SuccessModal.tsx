'use client';

import { useEffect } from 'react';
import { Check, Heart, Trophy, X } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  donationDetails: {
    amount: number;
    packName: string;
    childName: string;
    donationType: string;
  } | null;
}

export default function SuccessModal({ isOpen, onClose, donationDetails }: SuccessModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval: NodeJS.Timeout = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Créer des confettis depuis différents points
        if (typeof window !== 'undefined' && (window as any).confetti) {
          (window as any).confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
          });
          (window as any).confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
          });
        }
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen || !donationDetails) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 text-center border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Merci pour votre générosité ! 🎉
          </h2>
          <p className="text-gray-600">
            Votre don a été traité avec succès
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Donation Summary */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-3">Récapitulatif de votre don</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pack :</span>
                    <span className="font-medium">{donationDetails.packName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bénéficiaire :</span>
                    <span className="font-medium">{donationDetails.childName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type :</span>
                    <span className="font-medium">{donationDetails.donationType}</span>
                  </div>
                  <div className="flex justify-between text-lg pt-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">Montant :</span>
                    <span className="font-bold text-green-600">{donationDetails.amount}€</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Message */}
          <div className="bg-blue-50 rounded-xl p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Votre impact</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Grâce à votre don de <strong>{donationDetails.amount}€</strong>, vous contribuez directement 
                  au développement de <strong>{donationDetails.childName}</strong> et à son avenir dans le football. 
                  Votre générosité fait la différence !
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-3 mb-6">
            <h3 className="font-bold text-gray-900">Prochaines étapes :</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                Vous recevrez un reçu par email sous peu
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                Votre don sera transmis au bénéficiaire
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                Vous recevrez des mises à jour sur l'impact
              </li>
            </ul>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}