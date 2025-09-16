'use client';

import { useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { LogIn, UserPlus, Globe, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import UserDropdown from '@/components/UserDropdown';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const [lang, setLang] = useState('fr');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, loading, login, isAdmin } = useAuth();

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'ar', name: 'العربية', flag: '🇲🇦' },
  ];

  const selectedLanguage = languages.find(l => l.code === lang);

  return (
    <header className="gradient-bg text-white py-4 md:py-6 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo + Titre */}
          <Link href="/" className="flex items-center space-x-3 md:space-x-4 hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="PaieCashPlay Logo"
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
              priority
            />
            <div>
              <h1 className="text-xl md:text-2xl font-bold">PaieCashPlay</h1>
              <p className="text-blue-100 text-xs md:text-sm">Sport Solidaire</p>
            </div>
          </Link>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Authentication */}
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              </div>
            ) : (
              user ? (
                <div className="flex items-center space-x-4">
                  <UserDropdown />
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={login}
                    className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>S'inscrire</span>
                  </button>
                  <button 
                    onClick={login}
                    className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Connexion</span>
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/20">
            {/* Authentication Mobile */}
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            ) : (
              user ? (
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-medium overflow-hidden">
                        {user.picture ? (
                          <img 
                            src={`${user.picture}${user.picture.includes('?') ? '&' : '?'}t=${Date.now()}`} 
                            alt={user.name || 'Profil'} 
                            className="w-12 h-12 rounded-full object-cover" 
                            key={`${user.picture}-${Date.now()}`}
                          />
                        ) : (
                          <span>{user.given_name?.charAt(0) || ''}{user.family_name?.charAt(0) || ''}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-white/70">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Link href="/profile" className="flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg transition-colors">
                      <span>Mon profil</span>
                    </Link>
                    <Link href="/dashboard" className="flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg transition-colors">
                      <span>Dashboard</span>
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg transition-colors">
                        <span>Administration</span>
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <button 
                    onClick={login}
                    className="flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg transition-colors"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>S'inscrire</span>
                  </button>
                  <button 
                    onClick={login}
                    className="flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Connexion</span>
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </header>
  );
}