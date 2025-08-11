'use client';

import { useState, useEffect } from 'react';

interface DonationState {
  pack: any;
  selectedChild: any;
  step: 'child' | 'auth' | 'payment';
}

const DONATION_STATE_KEY = 'pending_donation_state';

export function useDonationState() {
  const [donationState, setDonationState] = useState<DonationState | null>(() => {
    // Initialisation directe depuis localStorage
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(DONATION_STATE_KEY);
      if (savedState) {
        try {
          return JSON.parse(savedState);
        } catch (error) {
          console.error('Erreur parsing donation state:', error);
          localStorage.removeItem(DONATION_STATE_KEY);
        }
      }
    }
    return null;
  });

  const saveDonationState = (state: DonationState) => {
    setDonationState(state);
    localStorage.setItem(DONATION_STATE_KEY, JSON.stringify(state));
  };

  const clearDonationState = () => {
    setDonationState(null);
    localStorage.removeItem(DONATION_STATE_KEY);
  };

  const hasPendingDonation = () => {
    return donationState !== null;
  };

  return {
    donationState,
    saveDonationState,
    clearDonationState,
    hasPendingDonation
  };
}