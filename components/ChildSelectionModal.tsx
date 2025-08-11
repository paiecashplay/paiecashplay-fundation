'use client';

import { useState, useEffect } from 'react';
import { X, Search, MapPin, Users } from 'lucide-react';
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
}

interface ChildSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChild: (child: Child) => void;
  packTitle: string;
}

export default function ChildSelectionModal({ isOpen, onClose, onSelectChild, packTitle }: ChildSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToastContext();

  // Charger les enfants depuis l'API OAuth publique
  useEffect(() => {
    if (isOpen) {
      fetchChildren();
    }
  }, [isOpen]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_OAUTH_ISSUER || 'http://localhost:3000'}/api/public/players`);
      const result = await response.json();
      
      if (result.players) {
        const formattedChildren = result.players.map((player: any) => ({
          id: player.id,
          nom: player.lastName || 'Nom',
          prenom: player.firstName || 'Prénom',
          age: player.metadata?.birthDate ? 
            new Date().getFullYear() - new Date(player.metadata.birthDate).getFullYear() : 18,
          position: player.metadata?.position || 'Joueur',
          has_license: false,
          photo_emoji: getRandomEmoji(),
          club_nom: player.club?.name || 'Club de Football',
          pays_nom: player.country || 'France',
          federation_nom: player.federation?.name || 'Fédération',
          flag_emoji: getCountryFlag(player.country || 'FR')
        }));
        setChildren(formattedChildren);
      } else {
        const errorMsg = 'Aucun enfant disponible';
        setError(errorMsg);
        toast.warning('Aucun enfant', errorMsg);
      }
    } catch (err) {
      const errorMsg = 'Erreur de connexion';
      setError(errorMsg);
      toast.error('Erreur de chargement', errorMsg);
      console.error('Erreur fetch enfants:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRandomEmoji = () => {
    const emojis = ['⚽', '🏃♂️', '🏆', '🥅', '👟', '🎯', '⭐', '🔥', '💪', '🏅'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  const getCountryFlag = (countryCode: string) => {
    const flags: { [key: string]: string } = {
      'FR': '🇫🇷', 'CM': '🇨🇲', 'SN': '🇸🇳', 'CI': '🇨🇮', 'MA': '🇲🇦',
      'DZ': '🇩🇿', 'TN': '🇹🇳', 'NG': '🇳🇬', 'GH': '🇬🇭', 'KE': '🇰🇪'
    };
    return flags[countryCode] || '🌍';
  };

  const filteredChildren = children.filter(child =>
    child.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.club_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.pays_nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedChild) {
      toast.success('Enfant sélectionné', `${selectedChild.prenom} ${selectedChild.nom} bénéficiera de votre don`);
      onSelectChild(selectedChild);
      // Ne pas fermer le modal ici, laisser le parent gérer
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative p-6 border-b border-gray-100">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">Choisir un enfant</h2>
          <p className="text-gray-600">Pack: {packTitle}</p>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, club ou pays..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73] outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="md" text="Chargement des enfants..." />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={fetchChildren}
                className="bg-[#4FBA73] text-white px-4 py-2 rounded-lg hover:bg-[#3da562]"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-h-96 overflow-y-auto">
              {filteredChildren.map((child) => (
                <div
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedChild?.id === child.id
                      ? 'border-[#4FBA73] bg-[#4FBA73]/5'
                      : 'border-gray-200 hover:border-[#4FBA73]/50'
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl mr-3">
                      {child.photo_emoji}
                    </div>
                    <div>
                      <h3 className="font-bold">{child.prenom} {child.nom}</h3>
                      <p className="text-sm text-gray-600">{child.age} ans • {child.position}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{child.club_nom}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">{child.flag_emoji}</span>
                      <span>{child.pays_nom} ({child.federation_nom})</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      Sans licence
                    </span>
                  </div>
                </div>
              ))}
              
              {filteredChildren.length === 0 && !loading && (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  Aucun enfant trouvé pour cette recherche
                </div>
              )}
            </div>
          )}

          {selectedChild && (
            <div className="bg-[#4FBA73]/10 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-[#4FBA73] mb-2">Enfant sélectionné :</h3>
              <div className="flex items-center">
                <span className="text-2xl mr-3">{selectedChild.photo_emoji}</span>
                <div>
                  <p className="font-medium">{selectedChild.prenom} {selectedChild.nom}</p>
                  <p className="text-sm text-gray-600">
                    {selectedChild.club_nom} • {selectedChild.pays_nom}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedChild}
              className="flex-1 bg-[#4FBA73] hover:bg-[#3da562] text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuer avec cet enfant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}