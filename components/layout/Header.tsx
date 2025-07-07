'use client';

import { useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { LogIn } from 'lucide-react';
import Link from 'next/link';
import UserDropdown from '@/components/UserDropdown';
import { useAuthState } from '@/hooks/useAuth';

export function Header() {
  const [lang, setLang] = useState('fr');
  const { admin, loading } = useAuthState();

  return (
    <>
      {/* Language Selector */}
      <div className="language-selector absolute top-5 right-5 z-50 bg-white rounded-lg px-4 py-2 shadow">
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="border-none outline-none text-sm bg-white"
        >
          <option value="fr">🇫🇷 Français</option>
          <option value="en">🇬🇧 English</option>
          <option value="es">🇪🇸 Español</option>
          <option value="de">🇩🇪 Deutsch</option>
          <option value="it">🇮🇹 Italiano</option>
          <option value="ar">🇲🇦 العربية</option>
        </select>
      </div>

      {/* Header */}
      <header className="gradient-bg text-white py-6 relative">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo + Titre */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-xl">P</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">PaieCashPlay</h1>
                <p className="text-blue-100">Sport Solidaire</p>
              </div>
            </div>

            {/* Authentification */}
            <div className="flex items-center space-x-4">
              {!loading && (
                admin ? (
                  // Menu admin connecté
                  <>
                    <div className="relative">
                      <FaBell className="text-xl cursor-pointer" />
                      <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        3
                      </span>
                    </div>
                    <UserDropdown />
                  </>
                ) : (
                  // Bouton de connexion
                  <Link href="/login">
                    <button className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                      <LogIn className="w-4 h-4" />
                      <span>Connexion</span>
                    </button>
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
