'use client';

import { Shield, Home } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6">
          <Image 
            src="/logo.png" 
            alt="PaieCashPlay Logo" 
            width={80} 
            height={80}
            className="rounded-full"
          />
        </div>
        
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès non autorisé</h1>
          <p className="text-gray-600">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>
        
        <Link 
          href="/"
          className="inline-flex items-center justify-center space-x-2 bg-[#4FBA73] text-white py-3 px-6 rounded-lg hover:bg-[#3da562] transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Retour à l'accueil</span>
        </Link>
      </div>
    </div>
  );
}