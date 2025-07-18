'use client';

import { useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { LogIn, UserPlus, Globe, Menu, X } from 'lucide-react';
import Link from 'next/link';
import UserDropdown from '@/components/UserDropdown';
import { useKeycloakAuth } from '@/hooks/useKeycloakAuth';
import { keycloakUrls } from '@/lib/keycloak';

export function Header() {
  const [lang, setLang] = useState('fr');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, loading, isAdmin } = useKeycloakAuth();

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
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-lg md:text-xl">P</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">PaieCashPlay</h1>
              <p className="text-blue-100 text-xs md:text-sm">Sport Solidaire</p>
            </div>
          </div>

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
            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>{selectedLanguage?.flag} {selectedLanguage?.name}</span>
              </button>
              
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        setLang(language.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 ${lang === language.code ? 'bg-gray-50 text-green-600' : 'text-gray-700'}`}
                    >
                      <span>{language.flag}</span>
                      <span>{language.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Authentication */}
            {loading ? (
              // État de chargement
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              </div>
            ) : (
              user ? (
                // Menu admin connecté
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <FaBell className="text-xl cursor-pointer" />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      3
                    </span>
                  </div>
                  <UserDropdown />
                </div>
              ) : (
                // Boutons d'authentification Keycloak
                <div className="flex items-center space-x-3">
                  <a href={keycloakUrls.register} className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                    <UserPlus className="w-4 h-4" />
                    <span>S'inscrire</span>
                  </a>
                  <a href={keycloakUrls.login} className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                    <LogIn className="w-4 h-4" />
                    <span>Connexion</span>
                  </a>
                </div>
              )
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/20">
            {/* Language Selector Mobile */}
            <div className="mb-4">
              <p className="text-sm text-white/70 mb-2">Langue</p>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => setLang(language.code)}
                    className={`px-3 py-2 rounded-lg flex items-center space-x-2 ${lang === language.code ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}
                  >
                    <span>{language.flag}</span>
                    <span>{language.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Authentication Mobile */}
            {loading ? (
              // État de chargement mobile
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            ) : (
              user ? (
                <div className="space-y-4">
                  {/* User Info */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-medium">
                        {user.firstName?.charAt(0) || ''}{user.lastName?.charAt(0) || ''}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-white/70">{user.email}</p>
                      </div>
                      <div className="relative">
                        <FaBell className="text-xl cursor-pointer" />
                        <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          3
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* User Actions */}
                  <div className="flex flex-col space-y-2">
                    <Link href="/profile" className="flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg transition-colors">
                      <span>Mon profil</span>
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg transition-colors">
                        <span>Administration</span>
                      </Link>
                    )}
                    <button 
                      onClick={() => window.location.href = keycloakUrls.logout}
                      className="flex items-center justify-center space-x-2 bg-red-500/20 hover:bg-red-500/30 px-4 py-3 rounded-lg transition-colors text-white"
                    >
                      <LogIn className="w-5 h-5 transform rotate-180" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <a href={keycloakUrls.register} className="flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg transition-colors">
                    <UserPlus className="w-5 h-5" />
                    <span>S'inscrire</span>
                  </a>
                  <a href={keycloakUrls.login} className="flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg transition-colors">
                    <LogIn className="w-5 h-5" />
                    <span>Connexion</span>
                  </a>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </header>
  );
}
