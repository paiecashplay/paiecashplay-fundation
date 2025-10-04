'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { getOAuthConfig } from '@/lib/auth';

interface Club {
  id: string;
  name: string;
  country: string;
  federation?: string;
  playerCount?: number;
  isVerified?: boolean;
}

interface ClubSelectorProps {
  value?: Club | null;
  onChange: (club: Club | null) => void;
  placeholder?: string;
  defaultCountry?: string;
}

export default function ClubSelector({ value, onChange, placeholder = "Sélectionner un club", defaultCountry }: ClubSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchClubs(1, '');
    }
  }, [isOpen]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (isOpen) {
        fetchClubs(1, searchTerm);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchClubs = async (pageNum: number, search: string) => {
    try {
      setLoading(true);
      
      let url = `${getOAuthConfig().issuer}/api/public/clubs?page=${pageNum}&limit=20`;
      if (defaultCountry) {
        url += `&country=${encodeURIComponent(defaultCountry)}`;
      }
      if (search.trim()) {
        // Recherche par nom (on peut améliorer l'API OAuth pour supporter la recherche)
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.clubs) {
        const newClubs = data.clubs.filter((club: any) => 
          !search.trim() || club.name.toLowerCase().includes(search.toLowerCase())
        );

        if (pageNum === 1) {
          setClubs(newClubs);
        } else {
          setClubs(prev => [...prev, ...newClubs]);
        }

        setHasMore(data.pagination.page < data.pagination.pages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Erreur chargement clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchClubs(page + 1, searchTerm);
    }
  };

  const handleSelect = (club: Club) => {
    onChange(club);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange(null);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-left bg-white hover:border-gray-400 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73] flex items-center justify-between"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value ? `${value.name} (${value.country})` : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un club..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {value && (
              <button
                onClick={handleClear}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b text-red-600 text-sm"
              >
                Aucun club
              </button>
            )}

            {clubs.length === 0 && !loading ? (
              <div className="px-3 py-4 text-gray-500 text-center">
                {searchTerm ? 'Aucun club trouvé' : 'Aucun club disponible'}
              </div>
            ) : (
              clubs.map((club) => (
                <button
                  key={club.id}
                  onClick={() => handleSelect(club)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between group"
                >
                  <div>
                    <div className="font-medium text-gray-900 flex items-center">
                      {club.name}
                      {club.isVerified && (
                        <span className="ml-2 text-blue-500 text-xs">✓</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {club.country}
                      {club.federation && ` • ${club.federation}`}
                      {club.playerCount && ` • ${club.playerCount} joueurs`}
                    </div>
                  </div>
                  {value?.id === club.id && (
                    <Check className="w-4 h-4 text-[#4FBA73]" />
                  )}
                </button>
              ))
            )}

            {loading && (
              <div className="px-3 py-4 text-center">
                <div className="inline-block w-4 h-4 border-2 border-[#4FBA73] border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-500">Chargement...</span>
              </div>
            )}

            {hasMore && !loading && clubs.length > 0 && (
              <button
                onClick={loadMore}
                className="w-full px-3 py-2 text-center text-[#4FBA73] hover:bg-gray-50 text-sm"
              >
                Charger plus de clubs
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}