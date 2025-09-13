'use client'

import { useState, useRef, useEffect } from 'react';
import type { DonationPacksRef } from '@/components/DonationPack';
import { Header } from '@/components/layout/Header';
import NotificationBanner from '@/components/NotificationBanner';
import HeroSection from '../components/HeroSection';
import WallAndImpact from '../components/WallAndImpact';
import UserProfiles from '../components/UserProfiles';
import DonationPacks from '../components/DonationPack';
import ChildrenSupported from '../components/ChildrenSupported';
import ChallengeSection from '../components/ChallengeSection';
import RecentUpdatesAndSocial from '../components/RecentUpdatesAndSocial';
import CallToAction from '../components/CallToAction';
import Footer from '@/components/layout/Footer';
import DonationResume from '../components/DonationResume';



export default function Home() {
  const donationPacksRef = useRef<DonationPacksRef>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier s'il y a une erreur d'authentification dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('auth_error');
    if (error) {
      setAuthError(error);
      // Nettoyer l'URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleOpenChampionModal = () => {
    if (donationPacksRef.current) {
      donationPacksRef.current.openChampionModal();
    }
  };

  return (
    <>    
    <div className="bg-gray-50">
      <Header />
      
      {/* Message d'erreur d'authentification */}
      {authError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mt-4 rounded relative">
          <strong className="font-bold">Erreur d'authentification : </strong>
          <span className="block sm:inline">{authError}</span>
          <button
            onClick={() => setAuthError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="sr-only">Fermer</span>
            ×
          </button>
        </div>
      )}
      {/* <NotificationBanner /> */}
      {/* Hero Section with Mobile Mockup */}
      <div className="relative">
        {/* Image de fond */}
        <div className="absolute inset-0 z-0 h-full">
          <img 
            src="/hero-children.jpg" 
            alt="Enfants africains jouant au football" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        {/* Contenu HeroSection */}
        <div className="relative z-10 container mx-auto px-6 py-8" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <HeroSection />
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
         {/* Impact Statistics */}
        {/* <div className="grid md:grid-cols-4 gap-6 mb-16 text-center text-white">
          <div className="stats-card bg-blue-600 rounded-lg p-6">
            <div className="text-3xl font-bold mb-2">2,847</div>
            <div className="text-blue-100">Enfants Soutenus</div>
          </div>
          <div className="stats-card bg-green-600 rounded-lg p-6">
            <div className="text-3xl font-bold mb-2">1,256</div>
            <div className="text-blue-100">Équipements Donnés</div>
          </div>
          <div className="stats-card bg-purple-600 rounded-lg p-6">
            <div className="text-3xl font-bold mb-2">€45,890</div>
            <div className="text-blue-100">Total des Dons</div>
          </div>
          <div className="stats-card bg-orange-600 rounded-lg p-6">
            <div className="text-3xl font-bold mb-2">892</div>
            <div className="text-blue-100">Donateurs Actifs</div>
          </div>
        </div> */}
        {/* User Profiles Section */}
        {/* <UserProfiles /> */}

        {/* Donation Packs Section */}
        <DonationPacks ref={donationPacksRef} />

        {/* Children Supported Section */}
        <ChildrenSupported />

        {/* Challenge Section */}
        <ChallengeSection onOpenChampionModal={handleOpenChampionModal} />

        {/* Impact Statistics */}
        <WallAndImpact donationPacksRef={donationPacksRef} />
      
        {/* Recent Updates Feed */}
      <RecentUpdatesAndSocial />
        


      {/* Call to Action */}
      <CallToAction />
      </div>
    </div>
    <Footer />
    
    {/* Composant pour reprendre le don après connexion */}
    <DonationResume />
    </>
  );
}