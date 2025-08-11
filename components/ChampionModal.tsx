'use client';

import { useState, useEffect } from 'react';
import { X, Trophy, Calendar, Heart, Target, Star } from 'lucide-react';

interface ChampionModalProps {
  isOpen: boolean;
  onClose: () => void;
  champion: any;
}

export default function ChampionModal({ isOpen, onClose, champion }: ChampionModalProps) {
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && champion) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 3000);
    }
  }, [isOpen, champion]);

  if (!isOpen || !champion) return null;

  const getDonorLevel = (totalDons: number) => {
    if (totalDons >= 1000) return { level: 'Platine', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (totalDons >= 500) return { level: 'Or', color: 'text-yellow-500', bg: 'bg-yellow-50' };
    if (totalDons >= 200) return { level: 'Argent', color: 'text-gray-500', bg: 'bg-gray-100' };
    if (totalDons >= 50) return { level: 'Bronze', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { level: 'Supporter', color: 'text-blue-600', bg: 'bg-blue-100' };
  };

  const getNextLevel = (totalDons: number) => {
    if (totalDons < 50) return { next: 'Bronze', needed: 50 - totalDons };
    if (totalDons < 200) return { next: 'Argent', needed: 200 - totalDons };
    if (totalDons < 500) return { next: 'Or', needed: 500 - totalDons };
    if (totalDons < 1000) return { next: 'Platine', needed: 1000 - totalDons };
    return null;
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'Fidélité': return '🏅';
      case 'Généreux': return '💎';
      case 'Récent': return '🔥';
      case 'Régulier': return '⭐';
      case 'Mécène': return '👑';
      default: return '🎖️';
    }
  };

  const level = getDonorLevel(champion.total_dons);
  const nextLevel = getNextLevel(champion.total_dons);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {confetti && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                fontSize: '20px'
              }}
            >
              🎉
            </div>
          ))}
        </div>
      )}
      
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="relative p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className={`w-20 h-20 ${level.bg} rounded-full flex items-center justify-center mx-auto mb-4 relative`}>
              <span className="text-3xl">{champion.photo_emoji}</span>
              {champion.is_recent && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {champion.prenom} {champion.nom?.charAt(0)}.
            </h2>
            <p className={`${level.color} font-semibold text-lg`}>
              Champion {level.level}
            </p>
            <p className="text-gray-600 text-sm">{champion.pays}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-2xl font-bold text-green-600">€{champion.total_dons}</div>
              <div className="text-sm text-green-700">Total donné</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{champion.nombre_donations}</div>
              <div className="text-sm text-blue-700">Donations</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">€{Math.round(champion.moyenne_don)}</div>
              <div className="text-sm text-purple-700">Moyenne</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <div className="text-2xl font-bold text-orange-600">{champion.anciennete_jours}</div>
              <div className="text-sm text-orange-700">Jours</div>
            </div>
          </div>

          {/* Badges */}
          {champion.badges && champion.badges.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                Badges
              </h3>
              <div className="flex flex-wrap gap-2">
                {champion.badges.map((badge: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    <span className="mr-1">{getBadgeIcon(badge)}</span>
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pack préféré */}
          {champion.pack_prefere && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-500" />
                Pack préféré
              </h3>
              <div className="bg-gradient-to-r from-red-50 to-pink-50 p-3 rounded-xl">
                <p className="text-red-700 font-medium">{champion.pack_prefere}</p>
              </div>
            </div>
          )}

          {/* Progression vers le niveau suivant */}
          {nextLevel && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Target className="h-5 w-5 mr-2 text-indigo-600" />
                Prochain niveau: {nextLevel.next}
              </h3>
              <div className="bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, ((champion.total_dons % (nextLevel.needed + champion.total_dons)) / (nextLevel.needed + champion.total_dons)) * 100)}%` 
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                Plus que €{nextLevel.needed} pour devenir Champion {nextLevel.next}
              </p>
            </div>
          )}

          {/* Dernière activité */}
          {champion.dernier_don && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-gray-600" />
                Dernière donation
              </h3>
              <p className="text-gray-600">
                {new Date(champion.dernier_don).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          )}

          {/* Action */}
          <div className="text-center">
            <button className="bg-gradient-to-r from-[#4FBA73] to-[#3da562] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <Star className="h-5 w-5 inline mr-2" />
              Féliciter ce champion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}