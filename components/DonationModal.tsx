'use client';

import { useState } from 'react';
import { X, Check, CreditCard } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import ChildSelectionModal from './ChildSelectionModal';

interface DonationPack {
  id: string;
  title: string;
  price: string;
  description: string;
  benefits: string[];
  icon: IconDefinition;
  iconBg: string;
  iconColor: string;
  buttonBg: string;
  buttonHover: string;
}

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pack: DonationPack | null;
}

export default function DonationModal({ isOpen, onClose, pack }: DonationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showChildSelection, setShowChildSelection] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);

  if (!isOpen || !pack) return null;

  const handleSelectChild = (child: any) => {
    setSelectedChild(child);
    setShowChildSelection(false);
  };

  const handlePayment = async () => {
    if (!selectedChild) {
      setShowChildSelection(true);
      return;
    }

    setIsProcessing(true);
    
    try {
      const { getStripe } = await import('@/lib/stripe');
      const stripe = await getStripe();
      
      const amount = parseInt(pack.price.match(/\d+/)?.[0] || '0');
      const isRecurring = pack.price.includes('/mois') || pack.price.includes('/saison');
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          donationType: isRecurring ? 'Don mensuel' : 'Don unique',
          packName: pack.title,
          isRecurring,
          childId: selectedChild.id,
          childName: selectedChild.name
        }),
      });
      
      const { sessionId } = await response.json();
      
      if (stripe && sessionId) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error('Erreur Stripe:', error);
        }
      }
    } catch (error) {
      console.error('Erreur de paiement:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setSelectedChild(null);
          setShowChildSelection(false);
          setIsProcessing(false);
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          <button
            onClick={() => {
              setSelectedChild(null);
              setShowChildSelection(false);
              setIsProcessing(false);
              onClose();
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className={`${pack.iconBg} w-16 h-16 rounded-full flex items-center justify-center`}>
              <FontAwesomeIcon className={`${pack.iconColor} text-2xl`} icon={pack.icon} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{pack.title}</h2>
              <p className={`${pack.iconColor} text-xl font-bold`}>{pack.price}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-6 leading-relaxed">{pack.description}</p>
          
          {/* Benefits */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Ce que vous recevrez :</h3>
            <ul className="space-y-3">
              {pack.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700 text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Pack sélectionné</span>
              <span className="font-medium">{pack.title}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Montant</span>
              <span className="font-medium">{pack.price}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                <span className={`font-bold text-xl ${pack.iconColor}`}>{pack.price}</span>
              </div>
            </div>
          </div>

          {/* Selected Child Display */}
          {selectedChild && (
            <div className="bg-[#4FBA73]/10 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-[#4FBA73] mb-2">Enfant sélectionné :</h3>
              <div className="flex items-center">
                <span className="text-2xl mr-3">{selectedChild.photo}</span>
                <div>
                  <p className="font-medium">{selectedChild.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedChild.club} • {selectedChild.country}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowChildSelection(true)}
                className="text-[#4FBA73] text-sm mt-2 hover:underline"
              >
                Changer d'enfant
              </button>
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${pack.buttonBg} ${pack.buttonHover} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Traitement en cours...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>{selectedChild ? 'Procéder au paiement' : 'Choisir un enfant'}</span>
              </>
            )}
          </button>

          {/* Security Notice */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              🔒 Paiement sécurisé par Stripe • Vos données sont protégées
            </p>
          </div>
        </div>
      </div>
      
      {/* Child Selection Modal */}
      <ChildSelectionModal
        isOpen={showChildSelection}
        onClose={() => {
          setShowChildSelection(false);
          // Ne pas réinitialiser selectedChild ici pour garder la sélection
        }}
        onSelectChild={handleSelectChild}
        packTitle={pack.title}
      />
    </div>
  );
}