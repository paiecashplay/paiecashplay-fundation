'use client';

import { Heart, ArrowRight } from 'lucide-react';

export default function NotificationBanner() {
  return (
    <div className="bg-gradient-to-r from-[#4FBA73] to-[#3da562] text-white py-3 px-6 mx-6 my-4 rounded-lg text-center">
      <Heart className="inline-block mr-2 h-5 w-5" />
      <strong>Pierre,</strong> votre don mensuel a permis à Amina de participer au tournoi de Lagos !
      <ArrowRight className="inline-block ml-2 h-5 w-5" />
    </div>
  );
}