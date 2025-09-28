'use client';

import { useState, useEffect } from 'react';
import { X, Check, CreditCard, Heart, User } from 'lucide-react';
import ChildSelectionModal from './ChildSelectionModal';
import AuthChoiceModal from './AuthChoiceModal';
import { useAuth } from '@/hooks/useAuth';
import { markUserAsDonor } from '@/lib/services/donorService';
import { useToastContext } from '@/components/ToastProvider';
import { useDonationState } from '@/hooks/useDonationState';

interface CustomDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  donationType: string;
}

export default function CustomDonationModal({ isOpen, onClose, amount, donationType }: CustomDonationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'child' | 'auth' | 'payment'>('child');
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { user, login } = useAuth();
  const { toast } = useToastContext();
  const { saveDonationState, clearDonationState } = useDonationState();

  useEffect(() => {
    if (isOpen) {
      setStep('child');
      setSelectedChild(null);
      setIsAnonymous(false);
    }
  }, [isOpen]);

  // Restaurer l'état sauvegardé si l'utilisateur est connecté
  useEffect(() => {
    if (isOpen && user && !selectedChild) {
      const savedState = localStorage.getItem('pending_donation_state');
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          if (parsedState.selectedChild) {
            setSelectedChild(parsedState.selectedChild);
            setStep('payment');
            localStorage.removeItem('pending_donation_state');
          }
        } catch (error) {
          console.error('Erreur restauration état:', error);
          localStorage.removeItem('pending_donation_state');
        }
      }
    }
  }, [isOpen, user, selectedChild]);

  if (!isOpen || !amount || Number(amount) <= 0) return null;

  const numericAmount = Number(amount);
  const isRecurring = donationType !== 'Don unique';

  const handleChildSelection = (child: any) => {
    setSelectedChild(child);
    if (user) {
      setStep('payment');
    } else {
      setStep('auth');
    }
  };

  const handleLogin = async () => {
    if (selectedChild) {
      saveDonationState({
        pack: { nom: 'Don personnalisé', prix: numericAmount, type_recurrence: donationType },
        selectedChild,
        step: 'payment'
      });
      toast.info('Don en attente', 'Votre don sera repris après connexion');
    }
    await login();
  };

  const handleAnonymous = () => {
    setIsAnonymous(true);
    setStep('payment');
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Si utilisateur connecté et pas anonyme, le marquer comme donateur
      if (user && !isAnonymous && user.access_token) {
        try {
          await markUserAsDonor(user.sub, {
            totalDonated: numericAmount,
            preferredCauses: ['youth_development']
          }, user, toast);
        } catch (error) {
          console.log('Utilisateur déjà donateur ou erreur:', error);
        }
      }

      const { getStripe } = await import('@/lib/stripe');
      const stripe = await getStripe();
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: numericAmount,
          donationType,
          packName: 'Don personnalisé',
          isRecurring,
          childId: selectedChild?.id,
          childName: `${selectedChild?.prenom} ${selectedChild?.nom}`,
          isAnonymous,
          donorId: isAnonymous ? null : user?.sub
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la session de paiement');
      }
      
      const { sessionId } = await response.json();
      
      if (stripe && sessionId) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          toast.error('Erreur de paiement', error.message || 'Erreur lors de la redirection');
          console.error('Erreur Stripe:', error);
        }
      } else {
        toast.error('Erreur de configuration', 'Impossible d\'initialiser le paiement');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error('Erreur lors du paiement', errorMessage);
      console.error('Erreur de paiement:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep('child');
    setSelectedChild(null);
    setIsAnonymous(false);
    clearDonationState();
    onClose();
  };

  // Rendu conditionnel selon l'étape
  if (step === 'child') {
    return (
      <ChildSelectionModal
        isOpen={true}
        onClose={handleClose}
        onSelectChild={handleChildSelection}
        packTitle="Don personnalisé"
      />
    );
  }

  if (step === 'auth') {
    return (
      <AuthChoiceModal
        isOpen={true}
        onClose={handleClose}
        onLogin={handleLogin}
        onAnonymous={handleAnonymous}
        packName="Don personnalisé"
        childName={`${selectedChild?.prenom} ${selectedChild?.nom}`}
        amount={numericAmount}
      />
    );
  }

  const benefits = [
    'Reçu fiscal pour déduction d\'impôts',
    'Rapport d\'impact trimestriel',
    'Accès à la communauté des donateurs',
    'Mises à jour sur l\'utilisation de votre don'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#4FBA73] to-[#3da562] rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Don Personnalisé</h2>
              <p className="text-[#4FBA73] text-xl font-bold">
                {numericAmount}€{isRecurring ? `/${donationType.split(' ')[1]}` : ''}
              </p>
            </div>
          </div>
          
          {/* Enfant sélectionné */}
          {selectedChild && (
            <div className="mt-4 p-3 bg-[#4FBA73]/10 rounded-lg">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{selectedChild.photo_emoji}</span>
                <div>
                  <p className="font-medium text-[#4FBA73]">
                    Pour {selectedChild.prenom} {selectedChild.nom}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedChild.club_nom} • {selectedChild.pays_nom}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-gradient-to-r from-[#4FBA73]/10 to-[#3da562]/10 rounded-xl p-4 mb-6">
            <p className="text-gray-700 leading-relaxed text-center">
              <span className="font-semibold">Merci pour votre générosité !</span><br />
              Votre don {isRecurring ? 'récurrent' : ''} contribuera directement à améliorer la vie des enfants africains à travers le sport.
            </p>
          </div>
          
          {/* Benefits */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Avec votre don, vous bénéficiez de :</h3>
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-[#4FBA73]/20 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[#4FBA73]" />
                  </div>
                  <span className="text-gray-700 text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Impact Preview */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Impact estimé de votre don :</h4>
            <div className="space-y-2 text-sm text-gray-600">
              {numericAmount >= 25 && (
                <p>• Peut financer 1 mois d'inscription sportive pour un enfant</p>
              )}
              {numericAmount >= 50 && (
                <p>• Peut équiper complètement 1 enfant</p>
              )}
              {numericAmount >= 100 && (
                <p>• Peut financer le transport d'une équipe vers un tournoi</p>
              )}
              {numericAmount < 25 && (
                <p>• Contribue aux frais généraux et au suivi des programmes</p>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-[#4FBA73]/5 rounded-xl p-4 mb-6 border border-[#4FBA73]/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Type de don</span>
              <span className="font-medium">{donationType}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Montant</span>
              <span className="font-medium">{numericAmount}€</span>
            </div>
            {isRecurring && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Fréquence</span>
                <span className="font-medium">{donationType.split(' ')[1]}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-xl text-[#4FBA73]">
                  {numericAmount}€{isRecurring ? `/${donationType.split(' ')[1]}` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 bg-[#4FBA73] hover:bg-[#3da562] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Traitement en cours...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Confirmer le don</span>
              </>
            )}
          </button>

          {/* Security Notice */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              🔒 Paiement sécurisé par Stripe • Vos données sont protégées
            </p>
            {isRecurring && (
              <p className="text-xs text-gray-500 mt-1">
                💡 Vous pouvez annuler votre don récurrent à tout moment
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}