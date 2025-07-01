'use client';

import { useState } from 'react';
import { FaBell } from 'react-icons/fa';
import UserDropdown from '@/components/UserDropdown';

export function Header() {
  const [lang, setLang] = useState('fr');

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

           
            {/* Notification + Profil */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaBell className="text-xl cursor-pointer" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </div>
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
