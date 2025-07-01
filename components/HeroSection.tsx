'use client';

import { Button } from '@/components/ui/button';
import { Download, Play } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative flex items-center justify-center h-screen overflow-hidden">
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
          Soutenez l'Enfance par le Sport
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          Transformez la vie d'enfants africains grâce au micro-sponsoring personnalisé et traçable
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="bg-[#4FBA73] hover:bg-[#3da562] text-lg px-8 py-4">
            <Download className="mr-2 h-5 w-5" />
            Télécharger l'App
          </Button>
          <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black text-lg px-8 py-4">
            <Play className="mr-2 h-5 w-5" />
            Voir la Démo
          </Button>
        </div>
      </div>
    </section>
  );
}