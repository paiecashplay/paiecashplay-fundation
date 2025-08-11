'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useDonationState } from '@/hooks/useDonationState';
import { useToastContext } from '@/components/ToastProvider';
import DonationModal from './DonationModal';
import SuccessModal from './SuccessModal';

export default function DonationResume() {
  const { user, loading } = useAuth();
  const { donationState, clearDonationState } = useDonationState();
  const { toast } = useToastContext();
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState(null);
  const [hasShownToast, setHasShownToast] = useState(false);
  const [hasHandledParams, setHasHandledParams] = useState(false);

  useEffect(() => {
    // Vérifier s'il y a un don en attente après connexion
    if (!loading && user && donationState && !hasShownToast) {
      setHasShownToast(true);
      toast.success('Connexion réussie', 'Reprise de votre processus de don...');
      // Délai court pour une meilleure UX
      setTimeout(() => {
        setShowModal(true);
      }, 500);
    }
  }, [user, loading, donationState, hasShownToast, toast]);

  // Gérer les paramètres URL (succès et annulation)
  useEffect(() => {
    if (hasHandledParams) return;
    
    const sessionId = searchParams.get('session_id');
    const cancelled = searchParams.get('cancelled');
    
    if (sessionId && !successDetails) {
      setHasHandledParams(true);
      fetchSuccessDetails(sessionId);
    } else if (cancelled === 'true') {
      setHasHandledParams(true);
      toast.warning('Paiement annulé', 'Votre don a été annulé. Vous pouvez réessayer quand vous le souhaitez.');
      // Nettoyer l'URL
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams, successDetails, hasHandledParams, toast]);

  const fetchSuccessDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/stripe/success?session_id=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSuccessDetails(data);
        setShowSuccessModal(true);
        // Nettoyer l'URL
        window.history.replaceState({}, '', '/');
      }
    } catch (error) {
      console.error('Erreur récupération succès:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setHasShownToast(false);
    clearDonationState();
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessDetails(null);
  };

  return (
    <>
      {donationState && (
        <DonationModal
          isOpen={showModal}
          onClose={handleCloseModal}
          pack={donationState.pack}
        />
      )}
      
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        donationDetails={successDetails}
      />
    </>
  );
}