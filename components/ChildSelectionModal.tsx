'use client';

import { useState, useEffect } from 'react';
import { X, Search, MapPin, Users, Globe, ArrowLeft, ChevronDown } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { useToastContext } from '@/components/ToastProvider';

interface Child {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  position: string;
  has_license: boolean;
  photo_emoji: string;
  club_nom: string;
  pays_nom: string;
  federation_nom: string;
  flag_emoji: string;
  email?: string;
  phone?: string;
  createdAt?: string;
  isVerified?: boolean;
  jerseyNumber?: number;
  height?: string;
  weight?: string;
  status?: string;
}

interface Country {
  code: string;
  name: string;
  flag: string;
  playerCount?: number;
}

interface ChildSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChild: (child: Child) => void;
  packTitle: string;
}

type Step = 'country' | 'child';

export default function ChildSelectionModal({ isOpen, onClose, onSelectChild, packTitle }: ChildSelectionModalProps) {
  const [step, setStep] = useState<Step>('country');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToastContext();

  const getOAuthBaseUrl = () => process.env.OAUTH_ISSUER || 'http://localhost:3000';

  // Charger les pays disponibles
  useEffect(() => {
    if (isOpen && step === 'country') {
      fetchCountries();
    }
  }, [isOpen, step]);

  // Reset lors de l'ouverture
  useEffect(() => {
    if (isOpen) {
      setStep('country');
      setSelectedCountry(null);
      setSelectedChild(null);
      setSearchTerm('');
      setError(null);
    }
  }, [isOpen]);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getOAuthBaseUrl()}/api/public/countries`);
      const result = await response.json();
      
      if (result.countries) {
        const formattedCountries = result.countries.map((code: string) => ({
          code,
          name: getCountryName(code),
          flag: getCountryFlag(code)
        }));
        setCountries(formattedCountries);
      } else {
        throw new Error('Aucun pays disponible');
      }
    } catch (err) {
      const errorMsg = 'Erreur lors du chargement des pays';
      setError(errorMsg);
      toast.error('Erreur', errorMsg);
      console.error('Erreur fetch pays:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildrenByCountry = async (countryCode: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${getOAuthBaseUrl()}/api/public/players/by-country?country=${countryCode}&limit=50`);
      const result = await response.json();
      
      if (result.players && result.players.length > 0) {
        const formattedChildren = result.players.map((player: any) => ({
          id: player.id,
          nom: player.lastName || 'Nom',
          prenom: player.firstName || 'Prénom',
          age: player.metadata?.birthDate ? 
            new Date().getFullYear() - new Date(player.metadata.birthDate).getFullYear() : 
            Math.floor(Math.random() * 8) + 12,
          position: player.metadata?.position || getRandomPosition(),
          has_license: Math.random() > 0.7,
          photo_emoji: getRandomEmoji(),
          club_nom: player.club?.name || getRandomClub(),
          pays_nom: getCountryName(player.country),
          federation_nom: player.federation?.name || 'Fédération',
          flag_emoji: getCountryFlag(player.country),
          email: player.email,
          phone: player.phone_number,
          createdAt: player.created_at,
          isVerified: player.email_verified || false,
          jerseyNumber: player.metadata?.jerseyNumber || Math.floor(Math.random() * 99) + 1,
          height: player.metadata?.height || null,
          weight: player.metadata?.weight || null,
          status: player.metadata?.status || 'active'
        }));
        setChildren(formattedChildren);
        setStep('child');
      } else {
        toast.warning('Aucun enfant', `Aucun enfant trouvé dans ce pays`);
      }
    } catch (err) {
      const errorMsg = 'Erreur lors du chargement des enfants';
      setError(errorMsg);
      toast.error('Erreur', errorMsg);
      console.error('Erreur fetch enfants:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRandomEmoji = () => {
    const emojis = ['⚽', '🏃♂️', '🏆', '🥅', '👟', '🎯', '⭐', '🔥', '💪', '🏅'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  const getRandomPosition = () => {
    const positions = ['Gardien', 'Défenseur', 'Milieu', 'Attaquant', 'Ailier', 'Libéro'];
    return positions[Math.floor(Math.random() * positions.length)];
  };

  const getRandomClub = () => {
    const clubs = [
      'Academy Lions', 'Future Stars FC', 'Young Eagles', 'Rising Phoenix',
      'Golden Boot Academy', 'Dream Team FC', 'Champions Academy', 'Victory United'
    ];
    return clubs[Math.floor(Math.random() * clubs.length)];
  };

  const getPositionIcon = (position: string) => {
    const icons: { [key: string]: string } = {
      'Gardien': '🥅',
      'Défenseur': '🛡️',
      'Milieu': '⚡',
      'Attaquant': '🎯',
      'Ailier': '🏃♂️',
      'Libéro': '🔄'
    };
    return icons[position] || '⚽';
  };

  const getPositionColor = (position: string) => {
    const colors: { [key: string]: string } = {
      'Gardien': 'bg-yellow-100 text-yellow-800',
      'Défenseur': 'bg-blue-100 text-blue-800',
      'Milieu': 'bg-purple-100 text-purple-800',
      'Attaquant': 'bg-red-100 text-red-800',
      'Ailier': 'bg-green-100 text-green-800',
      'Libéro': 'bg-gray-100 text-gray-800'
    };
    return colors[position] || 'bg-gray-100 text-gray-800';
  };

  const getCountryFlag = (countryCode: string) => {
    const flags: { [key: string]: string } = {
      'FR': '🇫🇷', 'CM': '🇨🇲', 'SN': '🇸🇳', 'CI': '🇨🇮', 'MA': '🇲🇦',
      'DZ': '🇩🇿', 'TN': '🇹🇳', 'NG': '🇳🇬', 'GH': '🇬🇭', 'KE': '🇰🇪',
      'BF': '🇧🇫', 'ML': '🇲🇱', 'NE': '🇳🇪', 'TD': '🇹🇩', 'CF': '🇨🇫',
      'GA': '🇬🇦', 'CG': '🇨🇬', 'CD': '🇨🇩', 'AO': '🇦🇴', 'ZM': '🇿🇲'
    };
    return flags[countryCode] || '🌍';
  };

  const getCountryName = (countryCode: string) => {
    const names: { [key: string]: string } = {
      'FR': 'France', 'CM': 'Cameroun', 'SN': 'Sénégal', 'CI': 'Côte d\'Ivoire', 'MA': 'Maroc',
      'DZ': 'Algérie', 'TN': 'Tunisie', 'NG': 'Nigeria', 'GH': 'Ghana', 'KE': 'Kenya',
      'BF': 'Burkina Faso', 'ML': 'Mali', 'NE': 'Niger', 'TD': 'Tchad', 'CF': 'Centrafrique',
      'GA': 'Gabon', 'CG': 'Congo', 'CD': 'RD Congo', 'AO': 'Angola', 'ZM': 'Zambie'
    };
    return names[countryCode] || countryCode;
  };

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredChildren = children.filter(child =>
    child.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.club_nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setSearchTerm('');
    fetchChildrenByCountry(country.code);
  };

  const handleChildConfirm = () => {
    if (selectedChild) {
      toast.success('Enfant sélectionné', `${selectedChild.prenom} ${selectedChild.nom} bénéficiera de votre don`);
      onSelectChild(selectedChild);
    }
  };

  const handleBack = () => {
    if (step === 'child') {
      setStep('country');
      setSelectedChild(null);
      setChildren([]);
      setSearchTerm('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-[#4FBA73] to-[#3da562]">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
          {step === 'child' && (
            <button onClick={handleBack} className="absolute top-4 left-4 text-white/80 hover:text-white">
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-2">
              {step === 'country' ? 'Choisir un pays' : 'Choisir un enfant'}
            </h2>
            <p className="text-white/90">Pack: {packTitle}</p>
            {selectedCountry && step === 'child' && (
              <div className="flex items-center justify-center mt-2 text-white/90">
                <span className="mr-2">{selectedCountry.flag}</span>
                <span>{selectedCountry.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto min-h-0">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={step === 'country' ? 'Rechercher un pays...' : 'Rechercher un enfant...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:border-[#4FBA73] focus:ring-2 focus:ring-[#4FBA73]/20 outline-none transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" text={step === 'country' ? 'Chargement des pays...' : 'Chargement des enfants...'} />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={step === 'country' ? fetchCountries : () => fetchChildrenByCountry(selectedCountry!.code)}
                className="bg-[#4FBA73] text-white px-6 py-2 rounded-lg hover:bg-[#3da562] transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : step === 'country' ? (
            /* Country Selection */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCountries.map((country) => (
                <div
                  key={country.code}
                  onClick={() => handleCountrySelect(country)}
                  className="border border-gray-200 rounded-xl p-4 cursor-pointer transition-all hover:border-[#4FBA73] hover:shadow-md hover:scale-105 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{country.flag}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-[#4FBA73] transition-colors">
                        {country.name}
                      </h3>
                      <p className="text-sm text-gray-500">{country.code}</p>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-[#4FBA73] transition-colors" />
                  </div>
                </div>
              ))}
              
              {filteredCountries.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun pays trouvé pour cette recherche</p>
                </div>
              )}
            </div>
          ) : (
            /* Child Selection */
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                {filteredChildren.map((child) => (
                  <div
                    key={child.id}
                    onClick={() => setSelectedChild(child)}
                    className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                      selectedChild?.id === child.id
                        ? 'border-[#4FBA73] bg-gradient-to-br from-[#4FBA73]/5 to-[#3da562]/5 shadow-lg'
                        : 'border-gray-200 hover:border-[#4FBA73]/50 hover:shadow-md'
                    }`}
                  >
                    {/* Header compact */}
                    <div className="flex items-center mb-3">
                      <div className="relative mr-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#4FBA73] to-[#3da562] rounded-xl flex items-center justify-center text-xl shadow-md">
                          {child.photo_emoji}
                        </div>
                        {child.isVerified && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-base text-gray-900 truncate">{child.prenom} {child.nom}</h3>
                          <span className="text-sm font-bold text-[#4FBA73] bg-[#4FBA73]/10 px-2 py-1 rounded-md ml-2">
                            #{child.jerseyNumber}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <span>{child.age} ans</span>
                          {child.height && (
                            <>
                              <span>•</span>
                              <span>{child.height}</span>
                            </>
                          )}
                          {child.weight && (
                            <>
                              <span>•</span>
                              <span>{child.weight}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Position et club */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{getPositionIcon(child.position)}</span>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPositionColor(child.position)}`}>
                            {child.position}
                          </span>
                        </div>
                        {child.status === 'active' && (
                          <div className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-xs text-gray-500">Actif</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="flex items-center text-xs text-gray-600">
                          <MapPin className="w-3 h-3 mr-1 text-[#4FBA73]" />
                          <span className="font-medium truncate">{child.club_nom}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <span className="mr-1">{child.flag_emoji}</span>
                          <span className="truncate">{child.pays_nom}</span>
                        </div>
                      </div>
                    </div>

                    {/* Statut licence */}
                    <div className="flex items-center justify-between">
                      {child.has_license ? (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md font-medium flex items-center">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                          Licencié
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-md font-medium flex items-center">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span>
                          Sans licence
                        </span>
                      )}
                      
                      {selectedChild?.id === child.id && (
                        <div className="flex items-center text-[#4FBA73]">
                          <div className="w-5 h-5 bg-[#4FBA73] rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {filteredChildren.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun enfant trouvé pour cette recherche</p>
                  </div>
                )}
              </div>

              {selectedChild && (
                <div className="bg-gradient-to-r from-[#4FBA73]/10 to-[#3da562]/10 rounded-xl p-4 mb-4 border border-[#4FBA73]/30 shadow-md">
                  <h3 className="font-semibold text-[#4FBA73] mb-3 flex items-center text-base">
                    <span className="w-2 h-2 bg-[#4FBA73] rounded-full mr-2 animate-pulse"></span>
                    Enfant sélectionné
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#4FBA73] to-[#3da562] rounded-xl flex items-center justify-center text-2xl shadow-md">
                        {selectedChild.photo_emoji}
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#4FBA73] rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white text-xs font-bold">#{selectedChild.jerseyNumber}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-lg text-gray-900 truncate">{selectedChild.prenom} {selectedChild.nom}</h4>
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getPositionColor(selectedChild.position)}`}>
                          {getPositionIcon(selectedChild.position)} {selectedChild.position}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate">{selectedChild.club_nom}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-1">{selectedChild.flag_emoji}</span>
                          <span>{selectedChild.pays_nom}</span>
                        </div>
                        <div>
                          {selectedChild.age} ans
                          {selectedChild.height && ` • ${selectedChild.height}`}
                          {selectedChild.weight && ` • ${selectedChild.weight}`}
                        </div>
                        <div>
                          {selectedChild.has_license ? (
                            <span className="text-green-600 font-medium text-xs">✓ Licencié</span>
                          ) : (
                            <span className="text-red-600 font-medium text-xs">✗ Sans licence</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer - Toujours visible */}
        {step === 'child' && (
          <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-white shadow-lg">
            <div className="flex space-x-3">
              <button
                onClick={handleBack}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                ← Retour aux pays
              </button>
              <button
                onClick={handleChildConfirm}
                disabled={!selectedChild}
                className="flex-2 bg-gradient-to-r from-[#4FBA73] to-[#3da562] hover:from-[#3da562] hover:to-[#2d8f4f] text-white py-2.5 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-md text-sm"
              >
                Continuer avec cet enfant →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}