'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, Trophy, Award, Play, Image as ImageIcon, Download, Share2, Heart, Star, Edit3, Save, X } from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import MediaUploader from '@/components/MediaUploader';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';
import CountrySelector from '@/components/CountrySelector';
import ClubSelector from '@/components/ClubSelector';
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
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
  language?: string;
  
  // Informations sportives
  position?: string;
  dateOfBirth?: string;
  age?: number;
  status?: string;
  preferredFoot?: string;
  jerseyNumber?: number;
  nationality?: string;
  placeOfBirth?: string;
  height?: number;
  weight?: number;
  
  // Expérience
  experience?: string;
  previousClubs?: Array<{
    name: string;
    period: string;
    position: string;
    achievements?: string[];
  }>;
  achievements?: Array<{
    title: string;
    year: number;
    organization: string;
  }>;
  
  // Informations médicales
  injuries?: Array<{
    type: string;
    date: string;
    status: string;
    duration: string;
  }>;
  medicalInfo?: {
    bloodType?: string;
    allergies?: string[];
    medications?: string[];
    lastCheckup?: string;
  };
  
  // Contact d'urgence
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  
  // Éducation
  education?: {
    level: string;
    institution: string;
    field: string;
    graduationYear?: number;
  };
  
  // Préférences
  preferences?: {
    communicationLanguage?: string;
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    privacy?: {
      showPhone?: boolean;
      showEmail?: boolean;
      showStats?: boolean;
    };
  };
  
  // Notes
  notes?: string;
  
  // Club
  club?: {
    id: string;
    name: string;
    country?: string;
    federation?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
    foundedYear?: number;
    description?: string;
    isVerified?: boolean;
  };
  
  // Statistiques
  statistics?: {
    season: string;
    matches: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    minutesPlayed: number;
    rating: number;
  };
  
  // Statut contractuel
  contractStatus?: string;
  
  // Métadonnées
  metadata?: {
    customFields?: any;
    internalNotes?: string;
    lastUpdatedBy?: string;
  };
  
  // Stats locales
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
  saison: string;
  club_nom: string;
  joueur_prenom: string;
  joueur_nom: string;
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

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'licenses' | 'sponsors' | 'media'>('overview');
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
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
        setLicenses(licensesData.licenses || []);
      }

      // Fetch player media
      const mediaResponse = await fetch(`/api/players/${playerId}/media`);
      if (mediaResponse.ok) {
        const mediaData = await mediaResponse.json();
        setMedia(mediaData);
      }

      // Fetch player sponsors
      const sponsorsResponse = await fetch(`/api/players/${playerId}/sponsors`);
      if (sponsorsResponse.ok) {
        const sponsorsData = await sponsorsResponse.json();
        setSponsors(sponsorsData.data || []);
      }

      // Les clubs sont maintenant chargés directement dans le ClubSelector

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

  const handleEditMode = () => {
    setEditForm({
      ...player,
      firstName: player?.firstName || '',
      lastName: player?.lastName || '',
      country: player?.country || '',
      position: player?.position || '',
      height: player?.height || null,
      weight: player?.weight || null,
      preferredFoot: player?.preferredFoot || '',
      jerseyNumber: player?.jerseyNumber || null,
      notes: player?.notes || '',
      club: player?.club || null
    });
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    if (saving) return;
    
    // Validation des champs requis
    const errors = [];
    if (!editForm.firstName?.trim()) errors.push('Le prénom est requis');
    if (!editForm.lastName?.trim()) errors.push('Le nom est requis');
    if (!editForm.country?.trim()) errors.push('Le pays est requis');
    
    if (errors.length > 0) {
      toast.error('Champs requis manquants', errors.join(', '));
      return;
    }
    
    try {
      setSaving(true);
      const dataToSave = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
        country: editForm.country,
        height: editForm.height,
        weight: editForm.weight,
        metadata: {
          position: editForm.position,
          preferredFoot: editForm.preferredFoot,
          jerseyNumber: editForm.jerseyNumber,
          notes: editForm.notes,
          club: editForm.club?.name || editForm.club
        }
      };
      
      const response = await fetch(`/api/players/${playerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSave)
      });
      
      if (response.ok) {
        const result = await response.json();
        // Mettre à jour le player avec les nouvelles données
        setPlayer(prev => prev ? { 
          ...prev, 
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          country: editForm.country,
          position: editForm.position,
          height: editForm.height,
          weight: editForm.weight,
          preferredFoot: editForm.preferredFoot,
          jerseyNumber: editForm.jerseyNumber,
          notes: editForm.notes,
          club: editForm.club || prev.club 
        } : null);
        setEditing(false);
        toast.success('Profil mis à jour', 'Les informations ont été sauvegardées');
        // Recharger les données pour avoir la version complète
        setTimeout(() => {
          fetchPlayerData();
        }, 1500); // Plus de temps pour la synchronisation du club
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur de sauvegarde');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast.error('Erreur', error instanceof Error ? error.message : 'Impossible de sauvegarder le profil');
    } finally {
      setSaving(false);
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
                {(player.jerseyNumber || (canEdit && editing && editForm.jerseyNumber)) && (
                  <span className="text-3xl font-bold bg-white/20 px-4 py-2 rounded-lg">
                    #{editing ? (editForm.jerseyNumber || player.jerseyNumber) : player.jerseyNumber}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-white/90">
                {player.position && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getPositionIcon(player.position)}</span>
                    <span className="capitalize">{player.position}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{getCountryFlag(player.country)}</span>
                  <span>{player.country}</span>
                </div>

                {player.age && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>{player.age} ans</span>
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
                  <div className="text-2xl font-bold">{sponsors.length}</div>
                  <div className="text-sm text-white/80">Parrains</div>
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
                    disabled={saving}
                    className="bg-white text-[#4FBA73] p-3 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-[#4FBA73] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
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
                      onClick={handleEditMode}
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
              { id: 'sponsors', label: 'Parrains', icon: Heart },
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
                    <label className="text-sm font-medium text-gray-500">Prénom <span className="text-red-500">*</span></label>
                    {canEdit && editing ? (
                      <input
                        type="text"
                        value={editForm.firstName || ''}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                        required
                      />
                    ) : (
                      <p className="text-lg">{player.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nom <span className="text-red-500">*</span></label>
                    {canEdit && editing ? (
                      <input
                        type="text"
                        value={editForm.lastName || ''}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                        required
                      />
                    ) : (
                      <p className="text-lg">{player.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Numéro de maillot</label>
                    {canEdit && editing ? (
                      <input
                        type="number"
                        value={editForm.jerseyNumber || ''}
                        onChange={(e) => handleInputChange('jerseyNumber', parseInt(e.target.value) || null)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                        placeholder="Ex: 10"
                      />
                    ) : (
                      <p className="text-lg font-bold text-[#4FBA73]">
                        {player.jerseyNumber ? `#${player.jerseyNumber}` : 'Non défini'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Position</label>
                    {canEdit && editing ? (
                      <select
                        value={editForm.position || ''}
                        onChange={(e) => handleInputChange('position', e.target.value)}
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
                        <span>{getPositionIcon(player.position)}</span>
                        <span className="capitalize">{player.position || 'Non défini'}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Âge</label>
                    <p className="text-lg">{player.age || 'Non renseigné'} ans</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Statut</label>
                    <p className="text-lg">
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                        player.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {player.status || 'Actif'}
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Pied fort</label>
                    {canEdit && editing ? (
                      <select
                        value={editForm.preferredFoot || ''}
                        onChange={(e) => handleInputChange('preferredFoot', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                      >
                        <option value="">Sélectionner</option>
                        <option value="left">Gauche</option>
                        <option value="right">Droit</option>
                        <option value="both">Les deux</option>
                      </select>
                    ) : (
                      <p className="text-lg capitalize">{player.preferredFoot || 'Non défini'}</p>
                    )}
                  </div>

                  {player.nationality && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nationalité</label>
                      <p className="text-lg">{player.nationality}</p>
                    </div>
                  )}

                  {player.placeOfBirth && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Lieu de naissance</label>
                      <p className="text-lg">{player.placeOfBirth}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-500">Club</label>
                    {canEdit && editing ? (
                      <ClubSelector
                        value={editForm.club}
                        onChange={(club) => handleInputChange('club', club)}
                        placeholder="Rechercher et sélectionner un club"
                        defaultCountry={player.country}
                      />
                    ) : (
                      <p className="text-lg">{player.club?.name || 'Aucun club'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Taille</label>
                    {canEdit && editing ? (
                      <input
                        type="number"
                        step="0.1"
                        value={editForm.height || ''}
                        onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || null)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                        placeholder="Ex: 175"
                      />
                    ) : (
                      <p className="text-lg">{player.height ? `${player.height} cm` : 'Non renseigné'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Poids</label>
                    {canEdit && editing ? (
                      <input
                        type="number"
                        step="0.1"
                        value={editForm.weight || ''}
                        onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || null)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                        placeholder="Ex: 70"
                      />
                    ) : (
                      <p className="text-lg">{player.weight ? `${player.weight} kg` : 'Non renseigné'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Pays <span className="text-red-500">*</span></label>
                    {canEdit && editing ? (
                      <CountrySelector
                        value={editForm.country || ''}
                        onChange={(country) => handleInputChange('country', country)}
                      />
                    ) : (
                      <p className="text-lg flex items-center space-x-2">
                        <span>{getCountryFlag(player.country)}</span>
                        <span>{player.country}</span>
                      </p>
                    )}
                  </div>

                  {player.experience && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Niveau d'expérience</label>
                      <p className="text-lg capitalize">{player.experience}</p>
                    </div>
                  )}

                  {player.contractStatus && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Statut contractuel</label>
                      <p className="text-lg capitalize">{player.contractStatus}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Biographie</h2>
                {canEdit && editing ? (
                  <textarea
                    value={editForm.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={4}
                    placeholder="Décrivez votre parcours, vos objectifs..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {player.notes || 'Aucune biographie disponible'}
                  </p>
                )}
              </div>

              {/* Réalisations */}
              {player.achievements && player.achievements.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold mb-4">Réalisations</h2>
                  <div className="space-y-4">
                    {player.achievements.map((achievement, index) => (
                      <div key={index} className="border-l-4 border-[#4FBA73] pl-4">
                        <h3 className="font-semibold text-lg">{achievement.title}</h3>
                        <p className="text-gray-600">{achievement.organization} - {achievement.year}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clubs précédents */}
              {player.previousClubs && player.previousClubs.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold mb-4">Expérience</h2>
                  <div className="space-y-4">
                    {player.previousClubs.map((club, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{club.name}</h3>
                          <span className="text-sm text-gray-500">{club.period}</span>
                        </div>
                        <p className="text-gray-600 mb-2">Position: {club.position}</p>
                        {club.achievements && club.achievements.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Réalisations:</p>
                            <ul className="text-sm text-gray-600">
                              {club.achievements.map((achievement, i) => (
                                <li key={i} className="flex items-center space-x-1">
                                  <span className="w-1 h-1 bg-[#4FBA73] rounded-full"></span>
                                  <span>{achievement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Statistiques */}
              {player.statistics && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold mb-4">Statistiques {player.statistics.season}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-[#4FBA73]">{player.statistics.matches}</div>
                      <div className="text-sm text-gray-600">Matchs</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-[#4FBA73]">{player.statistics.goals}</div>
                      <div className="text-sm text-gray-600">Buts</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-[#4FBA73]">{player.statistics.assists}</div>
                      <div className="text-sm text-gray-600">Passes d.</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-[#4FBA73]">{player.statistics.rating}</div>
                      <div className="text-sm text-gray-600">Note moy.</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-500">{player.statistics.yellowCards}</div>
                      <div className="text-sm text-gray-600">Cartons J.</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-500">{player.statistics.redCards}</div>
                      <div className="text-sm text-gray-600">Cartons R.</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-[#4FBA73]">{Math.round(player.statistics.minutesPlayed / 90)}</div>
                      <div className="text-sm text-gray-600">Matchs complets</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-[#4FBA73]">{player.statistics.minutesPlayed}</div>
                      <div className="text-sm text-gray-600">Minutes</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Informations du club */}
              {player.club && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Club actuel</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-lg">{player.club.name}</p>
                      {player.club.country && (
                        <p className="text-sm text-gray-600 flex items-center space-x-1">
                          <span>{getCountryFlag(player.club.country)}</span>
                          <span>{player.club.country}</span>
                        </p>
                      )}
                    </div>
                    {player.club.federation && (
                      <p className="text-sm text-gray-600">{player.club.federation}</p>
                    )}
                    {player.club.foundedYear && (
                      <p className="text-sm text-gray-600">Fondé en {player.club.foundedYear}</p>
                    )}
                    {player.club.website && (
                      <a 
                        href={player.club.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#4FBA73] hover:underline text-sm"
                      >
                        Site web du club
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Éducation */}
              {player.education && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Éducation</h3>
                  <div className="space-y-2">
                    <p className="font-medium">{player.education.institution}</p>
                    <p className="text-sm text-gray-600">{player.education.field}</p>
                    <p className="text-sm text-gray-600">Niveau: {player.education.level}</p>
                    {player.education.graduationYear && (
                      <p className="text-sm text-gray-600">Diplômé en {player.education.graduationYear}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Contact d'urgence */}
              {player.emergencyContact && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Contact d'urgence</h3>
                  <div className="space-y-2">
                    <p className="font-medium">{player.emergencyContact.name}</p>
                    <p className="text-sm text-gray-600 capitalize">{player.emergencyContact.relationship}</p>
                    {player.emergencyContact.phone && (
                      <p className="text-sm text-gray-600">{player.emergencyContact.phone}</p>
                    )}
                    {player.emergencyContact.email && (
                      <p className="text-sm text-gray-600">{player.emergencyContact.email}</p>
                    )}
                  </div>
                </div>
              )}
              {/* Derniers parrains */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  Derniers parrains
                </h3>
                {sponsors.length === 0 ? (
                  <p className="text-gray-500 text-sm">Aucun parrain</p>
                ) : (
                  <>
                    {sponsors.slice(0, 3).map((sponsor) => (
                      <div key={sponsor.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium">
                            {sponsor.is_anonymous ? 'Donateur Anonyme' : (sponsor.donateur_nom || 'Donateur')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {sponsor.total_donne}€ • {sponsor.nombre_dons} don{sponsor.nombre_dons > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500">
                            {new Date(sponsor.date_dernier_don).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {sponsors.length > 3 && (
                      <button
                        onClick={() => setActiveTab('sponsors')}
                        className="w-full mt-4 text-[#4FBA73] hover:underline text-sm"
                      >
                        Voir tous les parrains
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Dernières licences */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Dernières licences</h3>
                {licenses.length === 0 ? (
                  <p className="text-gray-500 text-sm">Aucune licence</p>
                ) : (
                  <>
                    {licenses.slice(0, 3).map((license) => (
                      <div key={license.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium">{license.pack.nom}</p>
                          <p className="text-sm text-gray-500">
                            {license.saison} • {new Date(license.date_emission).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            license.statut === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {license.statut}
                          </span>
                          <button
                            onClick={() => window.open(`/api/licenses/${license.id}/pdf`, '_blank')}
                            className="text-[#4FBA73] hover:text-[#3da562] p-1"
                            title="Télécharger la licence"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
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
                  </>
                )}
              </div>

              {/* Contact */}
              {(player.email || player.phone) && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Contact</h3>
                  <div className="space-y-2">
                    {player.email && player.preferences?.privacy?.showEmail !== false && (
                      <p className="text-sm">
                        <span className="font-medium">Email:</span> {player.email}
                      </p>
                    )}
                    {player.phone && player.preferences?.privacy?.showPhone !== false && (
                      <p className="text-sm">
                        <span className="font-medium">Téléphone:</span> {player.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Informations médicales (si disponibles) */}
              {player.medicalInfo && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Informations médicales</h3>
                  <div className="space-y-2 text-sm">
                    {player.medicalInfo.bloodType && (
                      <p><span className="font-medium">Groupe sanguin:</span> {player.medicalInfo.bloodType}</p>
                    )}
                    {player.medicalInfo.lastCheckup && (
                      <p><span className="font-medium">Dernier bilan:</span> {new Date(player.medicalInfo.lastCheckup).toLocaleDateString()}</p>
                    )}
                    {player.medicalInfo.allergies && player.medicalInfo.allergies.length > 0 && (
                      <div>
                        <span className="font-medium">Allergies:</span>
                        <ul className="ml-4 mt-1">
                          {player.medicalInfo.allergies.map((allergy, index) => (
                            <li key={index} className="text-gray-600">• {allergy}</li>
                          ))}
                        </ul>
                      </div>
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
              <p className="text-gray-600 mt-1">Toutes les licences par club et saison</p>
            </div>
            <div className="p-6">
              {licenses.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune licence trouvée</p>
                  <p className="text-sm text-gray-400 mt-2">Les licences apparaissent lorsque le joueur rejoint un club</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {licenses.map((license) => (
                    <div key={license.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-[#4FBA73]">{license.pack.nom}</h3>
                          <p className="text-gray-600">{license.club_nom}</p>
                          <p className="text-sm text-gray-500">Saison {license.saison}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            license.statut === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {license.statut}
                          </span>
                          <button
                            onClick={() => window.open(`/api/licenses/${license.id}/pdf`, '_blank')}
                            className="bg-[#4FBA73] text-white px-4 py-2 rounded-lg hover:bg-[#3da562] transition-colors flex items-center space-x-2"
                          >
                            <Download className="w-4 h-4" />
                            <span>Télécharger</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Numéro de licence</p>
                          <p className="font-mono font-bold text-[#4FBA73]">{license.numero_licence}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Émission</p>
                          <p className="font-medium">{new Date(license.date_emission).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Expiration</p>
                          <p className="font-medium">{new Date(license.date_expiration).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Montant payé</p>
                          <p className="font-bold text-[#4FBA73]">{license.montant_paye}€</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Joueur: {license.joueur_prenom} {license.joueur_nom}</span>
                          <span>Valide pour: {license.club_nom}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'sponsors' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold flex items-center">
                <Heart className="w-6 h-6 mr-3 text-red-500" />
                Parrains et Donateurs
              </h2>
              <p className="text-gray-600 mt-1">Les généreux supporters qui soutiennent ce joueur</p>
            </div>
            <div className="p-6">
              {sponsors.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun parrain pour le moment</p>
                  <p className="text-sm text-gray-400 mt-2">Soyez le premier à soutenir ce joueur !</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sponsors.map((sponsor) => (
                    <div key={sponsor.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                            <Heart className="w-6 h-6 text-red-500" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">
                              {sponsor.is_anonymous ? 'Donateur Anonyme' : (sponsor.donateur_nom || 'Donateur')}
                            </h3>
                            {!sponsor.is_anonymous && sponsor.donateur_email && (
                              <p className="text-gray-600 text-sm">{sponsor.donateur_email}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#4FBA73]">
                            {sponsor.total_donne}€
                          </div>
                          <div className="text-sm text-gray-500">
                            {sponsor.nombre_dons} don{sponsor.nombre_dons > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Premier don</p>
                          <p className="font-medium">
                            {new Date(sponsor.date_premier_don).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Dernier don</p>
                          <p className="font-medium">
                            {new Date(sponsor.date_dernier_don).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Don moyen</p>
                          <p className="font-medium text-[#4FBA73]">
                            {Math.round(sponsor.total_donne / sponsor.nombre_dons)}€
                          </p>
                        </div>
                      </div>
                      
                      {sponsor.nombre_dons > 1 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              Parrain fidèle depuis {Math.ceil((new Date().getTime() - new Date(sponsor.date_premier_don).getTime()) / (1000 * 60 * 60 * 24))} jours
                            </span>
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                              ⭐ Supporter régulier
                            </span>
                          </div>
                        </div>
                      )}
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