'use client';

import { useState } from 'react';
import { UserPlus, LogIn, Shield } from 'lucide-react';
import { keycloakUrls } from '@/lib/keycloak';
import Image from 'next/image';

export default function AuthPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleRegister = () => {
    setLoading('register');
    window.location.href = keycloakUrls.register;
  };

  const handleLogin = () => {
    setLoading('login');
    window.location.href = keycloakUrls.login;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4FBA73] via-[#3da562] to-[#2d8a4e] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4">
            <Image 
              src="/logo.png" 
              alt="PaieCashPlay Logo" 
              width={96} 
              height={96}
              className="rounded-full"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">PaieCashPlay</h1>
          <p className="text-gray-600">Sport Solidaire</p>
        </div>

        {/* Boutons d'authentification */}
        <div className="space-y-4">
          {/* Créer un compte */}
          <button
            onClick={handleRegister}
            disabled={loading === 'register'}
            className="w-full bg-gradient-to-r from-[#4FBA73] to-[#3da562] text-white py-4 px-6 rounded-xl font-semibold hover:from-[#3da562] hover:to-[#2d8a4e] transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50"
          >
            {loading === 'register' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Créer un compte</span>
              </>
            )}
          </button>

          {/* Se connecter */}
          <button
            onClick={handleLogin}
            disabled={loading === 'login'}
            className="w-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white py-4 px-6 rounded-xl font-semibold hover:from-[#2563EB] hover:to-[#1D4ED8] transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50"
          >
            {loading === 'login' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Se connecter</span>
              </>
            )}
          </button>
        </div>

        {/* Informations */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <Shield className="w-4 h-4 text-[#4FBA73] mr-2" />
            <span className="text-sm font-medium text-gray-700">Sécurisé par Keycloak</span>
          </div>
          <p className="text-xs text-gray-600">
            Authentification sécurisée avec gestion des rôles et permissions
          </p>
        </div>

        {/* Types de comptes */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Types de comptes disponibles :</p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Donateur</span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Fédération</span>
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Club</span>
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">Joueur</span>
          </div>
        </div>
      </div>
    </div>
  );
}