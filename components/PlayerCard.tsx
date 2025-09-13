'use client';

import Link from 'next/link';
import { MapPin, Trophy, Calendar, Star } from 'lucide-react';

interface PlayerCardProps {
  player: {
    id: string;
    firstName: string;
    lastName: string;
    country: string;
    metadata?: {
      position?: string;
      birthDate?: string;
      jerseyNumber?: number;
    };
    club?: {
      name: string;
    };
  };
  showStats?: boolean;
}

export default function PlayerCard({ player, showStats = false }: PlayerCardProps) {
  const getPositionIcon = (position?: string) => {
    const icons: { [key: string]: string } = {
      'goalkeeper': '🥅',
      'defender': '🛡️',
      'midfielder': '⚡',
      'forward': '🎯'
    };
    return icons[position || ''] || '⚽';
  };

  const getPositionColor = (position?: string) => {
    const colors: { [key: string]: string } = {
      'goalkeeper': 'bg-yellow-100 text-yellow-800',
      'defender': 'bg-blue-100 text-blue-800',
      'midfielder': 'bg-purple-100 text-purple-800',
      'forward': 'bg-red-100 text-red-800'
    };
    return colors[position || ''] || 'bg-gray-100 text-gray-800';
  };

  const getCountryFlag = (countryCode: string) => {
    const flags: { [key: string]: string } = {
      'FR': '🇫🇷', 'CM': '🇨🇲', 'SN': '🇸🇳', 'CI': '🇨🇮', 'MA': '🇲🇦',
      'DZ': '🇩🇿', 'TN': '🇹🇳', 'NG': '🇳🇬', 'GH': '🇬🇭', 'KE': '🇰🇪'
    };
    return flags[countryCode] || '🌍';
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Link href={`/player/${player.id}`}>
      <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-[#4FBA73]/30 group">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#4FBA73] to-[#3da562] rounded-xl flex items-center justify-center text-2xl mr-4 shadow-md">
            ⚽
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#4FBA73] transition-colors">
                {player.firstName} {player.lastName}
              </h3>
              {player.metadata?.jerseyNumber && (
                <span className="text-lg font-bold text-[#4FBA73] bg-[#4FBA73]/10 px-2 py-1 rounded-lg">
                  #{player.metadata.jerseyNumber}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <span>{getCountryFlag(player.country)}</span>
                <span>{player.country}</span>
              </div>
              {player.metadata?.birthDate && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{calculateAge(player.metadata.birthDate)} ans</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="space-y-3">
          {player.metadata?.position && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getPositionIcon(player.metadata.position)}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPositionColor(player.metadata.position)}`}>
                  {player.metadata.position}
                </span>
              </div>
            </div>
          )}

          {player.club && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-[#4FBA73]" />
              <span>{player.club.name}</span>
            </div>
          )}

          {showStats && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Trophy className="w-3 h-3" />
                  <span>3 licences</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3" />
                  <span>1,250€ reçus</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}