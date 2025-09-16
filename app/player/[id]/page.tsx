'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, Trophy, Award, Play, Image as ImageIcon, Download, Share2, Heart, Star, Edit3, Save, X } from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import MediaUploader from '@/components/MediaUploader';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';
import { useToastContext } from '@/components/ToastProvider';

interface PlayerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  picture?: string;
  country: string;
  phone?: string;
  isVerified: boolean;
  createdAt: string;
  metadata?: {
    position?: string;
    height?: string;
    weight?: string;
    birthDate?: string;
    jerseyNumber?: number;
    bio?: string;
    achievements?: string[];
    socialMedia?: {
      instagram?: string;
      twitter?: string;
      facebook?: string;
    };
  };
  club?: {
    id: string;
    name: string;
  };
  federation?: {
    id: string;
    name: string;
  };
  stats?: {
    totalLicenses: number;
    activeLicenses: number;
    totalDonationsReceived: number;
  };
}

interface License {
  id: string;
  numero_licence: string;
  date_emission: string;
  date_expiration: string;
  statut: string;
  montant_paye: number;
  devise: string;
  pack: {
    nom: string;
    code: string;
    prix: number;
  };
}

interface PlayerMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  description?: string;
  createdAt: string;
}

export default function PlayerProfilePage() {
  const params = useParams();
  const playerId = params.id as string;
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [media, setMedia] = useState<PlayerMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [clubs, setClubs] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'licenses' | 'media'>('overview');
  const { toast } = useToastContext();

  useEffect(() => {
    if (playerId) {
      fetchPlayerData();
    }
  }, [playerId]);

  const fetchPlayerData = async () => {
    try {
      setLoading(true);
      
      // Vérifier l'utilisateur connecté
      try {
        const userResponse = await fetch('/api/auth/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUser(userData);
          
          // Vérifier si peut éditer (joueur lui-même ou club propriétaire)
          let canEditProfile = userData.sub === playerId;
          
          if (!canEditProfile && userData.user_type === 'club') {
            // Vérifier si le joueur est membre du club
            try {
              const membersResponse = await fetch('/api/club/members');
              if (membersResponse.ok) {
                const membersData = await membersResponse.json();
                const members = Array.isArray(membersData) ? membersData : (membersData.members || []);
                canEditProfile = members.some((member: any) => member.id === playerId);
              }
            } catch (error) {
              console.error('Erreur vérification membre:', error);
            }
          }
          
          setCanEdit(canEditProfile);
        }
      } catch (error) {
        // Utilisateur non connecté, mode lecture seule
        setCanEdit(false);
      }
      
      // Fetch player profile
      const playerResponse = await fetch(`/api/players/${playerId}`);
      if (playerResponse.ok) {
        const playerData = await playerResponse.json();
        setPlayer(playerData);
        setEditForm(playerData);
        
          // Forcer le rechargement des données utilisateur pour la photo
        if (canEdit) {
          try {
            const userResponse = await fetch(`/api/auth/me?t=${Date.now()}`, {
              cache: 'no-store',
              headers: { 'Cache-Control': 'no-cache' }
            });
            if (userResponse.ok) {
              const userData = await userResponse.json();
              if (userData.picture && userData.picture !== playerData.picture) {
                setPlayer(prev => prev ? { ...prev, picture: userData.picture } : null);
              }
            }
          } catch (error) {
            // Ignore les erreurs de rechargement
          }
        }
      }

      // Fetch player licenses
      const licensesResponse = await fetch(`/api/players/${playerId}/licenses`);
      if (licensesResponse.ok) {
        const licensesData = await licensesResponse.json();
        setLicenses(licensesData);
      }

      // Fetch player media
      const mediaResponse = await fetch(`/api/players/${playerId}/media`);
      if (mediaResponse.ok) {
        const mediaData = await mediaResponse.json();
        setMedia(mediaData);
      }

      // Fetch clubs list (seulement si peut éditer)
      if (canEdit) {
        const clubsResponse = await fetch('/api/club');
        if (clubsResponse.ok) {
          const clubsData = await clubsResponse.json();
          setClubs(clubsData.clubs || []);
        }
      }

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur', 'Impossible de charger le profil du joueur');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`/api/players/${playerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });
      
      if (response.ok) {
        const result = await response.json();
        setPlayer(editForm);
        setEditing(false);
        toast.success('Profil mis à jour', 'Les informations ont été sauvegardées');
      } else {
        throw new Error('Erreur de sauvegarde');
      }
    } catch (error) {
      toast.error('Erreur', 'Impossible de sauvegarder le profil');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditForm((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditForm((prev: any) => ({
        ...prev,
        [field]: value
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement du profil..." />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Joueur non trouvé</h1>
          <Link href="/" className="text-[#4FBA73] hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4FBA73] to-[#3da562] text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour à l'accueil
          </Link>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Avatar */}
            <div className="relative">
              {canEdit ? (
                <ProfilePictureUpload
                  userId={playerId}
                  currentPicture={player.picture}
                  onPictureUpdate={(url) => {
                    setPlayer(prev => prev ? {
                      ...prev,
                      picture: url
                    } : null)
                    // Mettre à jour aussi l'utilisateur connecté si c'est son profil
                    if (currentUser && currentUser.sub === playerId) {
                      // Pas d'accès direct à updateUser ici, mais l'image sera mise à jour au prochain rechargement
                    }
                  }}
                  size="lg"
                />
              ) : (
                <div className="w-48 h-48 rounded-full overflow-hidden bg-gradient-to-br from-[#4FBA73] to-[#3da562] flex items-center justify-center">
                  {player.picture ? (
                    <img
                      src={player.picture}
                      alt="Photo de profil"
                      className="w-full h-full object-cover"
                      key={player.picture} // Force le re-render
                    />
                  ) : (
                    <span className="text-white text-6xl font-bold">
                      {player.firstName.charAt(0)}
                    </span>
                  )}
                </div>
              )}
              {player.isVerified && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
            </div>

            {/* Info principale */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <h1 className="text-4xl font-bold">{player.firstName} {player.lastName}</h1>
                {player.metadata?.jerseyNumber && (
                  <span className="text-3xl font-bold bg-white/20 px-4 py-2 rounded-lg">
                    #{player.metadata.jerseyNumber}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-white/90">
                {player.metadata?.position && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getPositionIcon(player.metadata.position)}</span>
                    <span className="capitalize">{player.metadata.position}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{getCountryFlag(player.country)}</span>
                  <span>{player.country}</span>
                </div>

                {player.metadata?.birthDate && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>{calculateAge(player.metadata.birthDate)} ans</span>
                  </div>
                )}

                {player.club && (
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5" />
                    <span>{player.club.name}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex space-x-6 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{player.stats?.totalLicenses || 0}</div>
                  <div className="text-sm text-white/80">Licences</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{player.stats?.activeLicenses || 0}</div>
                  <div className="text-sm text-white/80">Actives</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{player.stats?.totalDonationsReceived || 0}€</div>
                  <div className="text-sm text-white/80">Reçus</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              {canEdit && editing ? (
                <>
                  <button
                    onClick={() => setEditing(false)}
                    className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="bg-white text-[#4FBA73] p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <button className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Lien copié', 'Le lien du profil a été copié dans le presse-papiers');
                    }}
                    className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => setEditing(true)}
                      className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Aperçu', icon: Star },
              { id: 'licenses', label: 'Licences', icon: Award },
              { id: 'media', label: 'Médias', icon: ImageIcon }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-[#4FBA73] text-[#4FBA73]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informations personnelles */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Informations personnelles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Prénom</label>
                    {canEdit && editing ? (
                      <input
                        type="text"
                        value={editForm.firstName || ''}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                      />
                    ) : (
                      <p className="text-lg">{player.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nom</label>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.lastName || ''}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                      />
                    ) : (
                      <p className="text-lg">{player.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Position</label>
                    {editing ? (
                      <select
                        value={editForm.metadata?.position || ''}
                        onChange={(e) => handleInputChange('metadata.position', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                      >
                        <option value="">Sélectionner</option>
                        <option value="goalkeeper">Gardien</option>
                        <option value="defender">Défenseur</option>
                        <option value="midfielder">Milieu</option>
                        <option value="forward">Attaquant</option>
                      </select>
                    ) : (
                      <p className="text-lg flex items-center space-x-2">
                        <span>{getPositionIcon(player.metadata?.position)}</span>
                        <span>{player.metadata?.position || 'Non défini'}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Club</label>
                    {editing ? (
                      <select
                        value={editForm.club?.id || ''}
                        onChange={(e) => {
                          const selectedClub = clubs.find(club => club.id === e.target.value)
                          handleInputChange('club', selectedClub || { id: '', name: '' })
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                      >
                        <option value="">Sélectionner un club</option>
                        {clubs.map((club) => (
                          <option key={club.id} value={club.id}>
                            {club.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-lg">{player.club?.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Taille</label>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.metadata?.height || ''}
                        onChange={(e) => handleInputChange('metadata.height', e.target.value)}
                        placeholder="Ex: 175cm"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                      />
                    ) : (
                      <p className="text-lg">{player.metadata?.height || 'Non renseigné'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Poids</label>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.metadata?.weight || ''}
                        onChange={(e) => handleInputChange('metadata.weight', e.target.value)}
                        placeholder="Ex: 70kg"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                      />
                    ) : (
                      <p className="text-lg">{player.metadata?.weight || 'Non renseigné'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Pays</label>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.country || ''}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                      />
                    ) : (
                      <p className="text-lg flex items-center space-x-2">
                        <span>{getCountryFlag(player.country)}</span>
                        <span>{player.country}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Fédération</label>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.federation?.name || ''}
                        onChange={(e) => handleInputChange('federation.name', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                      />
                    ) : (
                      <p className="text-lg">{player.federation?.name}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Biographie</h2>
                {canEdit && editing ? (
                  <textarea
                    value={editForm.metadata?.bio || ''}
                    onChange={(e) => handleInputChange('metadata.bio', e.target.value)}
                    rows={4}
                    placeholder="Décrivez votre parcours, vos objectifs..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {player.metadata?.bio || 'Aucune biographie disponible'}
                  </p>
                )}
              </div>

              {player.metadata?.achievements && player.metadata.achievements.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold mb-4">Réalisations</h2>
                  <ul className="space-y-2">
                    {player.metadata.achievements.map((achievement, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-[#4FBA73]" />
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Dernières licences */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Dernières licences</h3>
                {licenses.slice(0, 3).map((license) => (
                  <div key={license.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{license.pack.nom}</p>
                      <p className="text-sm text-gray-500">{new Date(license.date_emission).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      license.statut === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {license.statut}
                    </span>
                  </div>
                ))}
                {licenses.length > 3 && (
                  <button
                    onClick={() => setActiveTab('licenses')}
                    className="w-full mt-4 text-[#4FBA73] hover:underline text-sm"
                  >
                    Voir toutes les licences
                  </button>
                )}
              </div>

              {/* Contact */}
              {(player.email || player.phone) && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Contact</h3>
                  <div className="space-y-2">
                    {player.email && (
                      <p className="text-sm">
                        <span className="font-medium">Email:</span> {player.email}
                      </p>
                    )}
                    {player.phone && (
                      <p className="text-sm">
                        <span className="font-medium">Téléphone:</span> {player.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'licenses' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Historique des licences</h2>
            </div>
            <div className="p-6">
              {licenses.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune licence trouvée</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {licenses.map((license) => (
                    <div key={license.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg">{license.pack.nom}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          license.statut === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {license.statut}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Numéro:</span> {license.numero_licence}
                        </div>
                        <div>
                          <span className="font-medium">Émission:</span> {new Date(license.date_emission).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Expiration:</span> {new Date(license.date_expiration).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Montant:</span> {license.montant_paye}€
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <MediaUploader
            playerId={playerId}
            media={media}
            onMediaUpdate={fetchPlayerData}
            canEdit={canEdit}
          />
        )}
      </div>
    </div>
  );
}