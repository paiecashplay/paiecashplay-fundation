'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Vérifier la position de défilement et mettre à jour la visibilité
  const toggleVisibility = () => {
    if (window.scrollY > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Fonction de défilement vers le haut
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <button
      onClick={scrollToTop}
      aria-label="Retour en haut de la page"
      className={cn(
        'fixed bottom-8 right-8 z-50 flex h-10 w-10 items-center justify-center rounded-full',
        'bg-[#4FBA73]/80 text-white shadow-lg backdrop-blur-sm transition-all duration-300',
        'hover:bg-[#4FBA73] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#4FBA73] focus:ring-offset-2',
        'md:bottom-12 md:right-12 md:h-12 md:w-12',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
      )}
    >
      <ChevronUp className="h-5 w-5 md:h-6 md:w-6" />
    </button>
  );
}