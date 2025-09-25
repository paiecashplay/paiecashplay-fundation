'use client';

import { useState, useEffect } from 'react';
import { X, Check, CreditCard, User } from 'lucide-react';
import ChildSelectionModal from './ChildSelectionModal';
import AuthChoiceModal from './AuthChoiceModal';
import { useAuth } from '@/hooks/useAuth';
import { markUserAsDonor } from '@/lib/services/donorService';
import { useToastContext } from '@/components/ToastProvider';
import { useDonationState } from '@/hooks/useDonationState';

interface DonationPack {
  id: string;
  nom: string;
  prix: number;
  description: string;
  avantages: string | string[];
  icone_fa: string;
  couleur_fond: string;
  couleur_icone: string;
  couleur_bouton: string;
  type_recurrence: string;
}

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pack: DonationPack | null;
}

export default function DonationModal({ isOpen, onClose, pack }: DonationModalProps) {
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
            // Nettoyer immédiatement l'état sauvegardé
            localStorage.removeItem('pending_donation_state');
          }
        } catch (error) {
          console.error('Erreur restauration état:', error);
          localStorage.removeItem('pending_donation_state');
        }
      }
    }
  }, [isOpen, user, selectedChild]);

  if (!isOpen || !pack) return null;

  const handleChildSelection = (child: any) => {
    setSelectedChild(child);
    if (user) {
      setStep('payment');
    } else {
      setStep('auth');
    }
  };

  const handleLogin = async () => {
    // Sauvegarder l'état de donation avant la connexion
    if (pack && selectedChild) {
      saveDonationState({
        pack,
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
            totalDonated: pack.prix,
            preferredCauses: ['youth_development']
          }, user, toast);
        } catch (error) {
          console.log('Utilisateur déjà donateur ou erreur:', error);
          // Ne pas bloquer le paiement si cette étape échoue
        }
      }

      const { getStripe } = await import('@/lib/stripe');
      const stripe = await getStripe();
      
      const amount = pack.prix;
      const isRecurring = pack.type_recurrence === 'mensuel' || pack.type_recurrence === 'annuel';
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          donationType: isRecurring ? `Don ${pack.type_recurrence}` : 'Don unique',
          packName: pack.nom,
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
    clearDonationState(); // Nettoyer l'état sauvegardé
    onClose();
  };

  // Rendu conditionnel selon l'étape
  if (step === 'child') {
    return (
      <ChildSelectionModal
        isOpen={true}
        onClose={handleClose}
        onSelectChild={handleChildSelection}
        packTitle={pack.nom}
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
        packName={pack.nom}
        childName={`${selectedChild?.prenom} ${selectedChild?.nom}`}
        amount={pack.prix}
      />
    );
  }

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
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: pack.couleur_fond }}>
              <i className={`fas ${pack.icone_fa} text-2xl`} style={{ color: pack.couleur_icone }}></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{pack.nom}</h2>
              <p className="text-xl font-bold" style={{ color: pack.couleur_icone }}>
                {pack.prix}€{pack.type_recurrence === 'mensuel' ? '/mois' : pack.type_recurrence === 'annuel' ? '/an' : ''}
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
          <p className="text-gray-700 mb-6 leading-relaxed">{pack.description}</p>
          
          {/* Benefits */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Ce que vous recevrez :</h3>
            <ul className="space-y-3">
              {(() => {
                try {
                  const benefits = typeof pack.avantages === 'string' 
                    ? JSON.parse(pack.avantages) 
                    : pack.avantages || [];
                  return benefits.map((benefit: string, index: number) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-gray-700 text-sm">{benefit}</span>
                    </li>
                  ));
                } catch (error) {
                  console.error('Erreur parsing avantages:', error);
                  return null;
                }
              })()}
            </ul>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Pack sélectionné</span>
              <span className="font-medium">{pack.nom}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Montant</span>
              <span className="font-medium">
                {pack.prix}€{pack.type_recurrence === 'mensuel' ? '/mois' : pack.type_recurrence === 'annuel' ? '/an' : ''}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-xl" style={{ color: pack.couleur_icone }}>
                  {pack.prix}€{pack.type_recurrence === 'mensuel' ? '/mois' : pack.type_recurrence === 'annuel' ? '/an' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: pack.couleur_bouton }}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Traitement en cours...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Procéder au paiement</span>
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
    </div>
  );
}