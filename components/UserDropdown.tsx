'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut, User, Settings } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout, isAdmin } = useAuth();

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  // Déterminer le nom à afficher selon le type d'utilisateur
  const getDisplayName = () => {
    const isIndividualUser = ['donor', 'player', 'affiliate'].includes(user.user_type);
    
    if (isIndividualUser) {
      return user.name || 'Utilisateur';
    } else {
      // Pour les organisations (club, federation, company, etc.)
      return user.metadata?.organizationName || user.name || 'Organisation';
    }
  };

  const fullName = getDisplayName();
  const initials = fullName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-medium overflow-hidden">
          {user.picture ? (
            <img 
              src={`${user.picture}${user.picture.includes('?') ? '&' : '?'}t=${Date.now()}`} 
              alt={fullName} 
              className="w-8 h-8 rounded-full object-cover" 
              key={`${user.picture}-${Date.now()}`}
            />
          ) : (
            initials
          )}
        </div>
        <span className="hidden md:inline">{fullName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{fullName}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-blue-600 capitalize">{user.user_type}</p>
              {user.metadata?.organizationName && !['donor', 'player', 'affiliate'].includes(user.user_type) && (
                <p className="text-xs text-gray-400">Organisation</p>
              )}
            </div>
          </div>

          <div className="py-1">
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4 mr-2" />
              Mon profil
            </Link>

            {user.user_type === 'club' && (
              <Link
                href="/dashboard"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            )}

            {/* Dashboard Donateur pour tous les utilisateurs ayant fait des dons */}
            <Link
              href="/donations"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Mes Donations
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Administration
              </Link>
            )}
          </div>

          <div className="border-t border-gray-100 pt-1">
            <button
              onClick={() => logout()}
              className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}