'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useToastContext } from '@/components/ToastProvider'
import { User, Mail, Phone, MapPin, Calendar, Trophy, Edit3, Save, X, Building, Users, Globe, Shield } from 'lucide-react'
import ProfilePictureUpload from '@/components/ProfilePictureUpload'
import Link from 'next/link'

interface ClubProfile {
  sub: string
  email: string
  email_verified: boolean
  name: string
  given_name: string
  family_name: string
  picture?: string
  phone_number?: string
  locale: string
  user_type: string
  is_active: boolean
  created_at: number
  updated_at: number
  metadata?: {
    clubName?: string
    organizationName?: string
    league?: string
    stadium?: string
    founded?: string
    website?: string
    description?: string
    capacity?: number
    colors?: string
    coach?: string
    country?: string
  }
}

export default function ProfilePage() {
  const { user, loading: authLoading, updateUser } = useAuth()
  const router = useRouter()
  const { toast } = useToastContext()
  const [profile, setProfile] = useState<ClubProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<Partial<ClubProfile>>({})

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.push('/api/auth/login')
      return
    }

    // Rediriger selon le type d'utilisateur
    if (user.user_type === 'club') {
      // Les clubs ont accès à cette page
    } else if (user.user_type === 'player') {
      // Rediriger les joueurs vers leur profil public
      router.push(`/player/${user.sub}`)
      return
    } else {
      // Autres types d'utilisateurs : profil générique
    }

    loadProfile()
  }, [user, authLoading])

  const loadProfile = async () => {
    try {
      setLoading(true)
      
      // Charger les données utilisateur depuis l'API OAuth pour tous les types
      // Ajouter un timestamp pour éviter le cache
      const response = await fetch(`/api/auth/me?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du profil')
      }
      
      const userData = await response.json()
      const profileData = {
        ...userData,
        metadata: userData.metadata || {}
      }
      
      setProfile(profileData as ClubProfile)
      setEditForm(profileData as ClubProfile)
      toast.success('Profil chargé', 'Informations récupérées avec succès')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de chargement'
      toast.error('Erreur de chargement', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditing(true)
    setEditForm(profile || {})
  }

  const handleCancel = () => {
    setEditing(false)
    setEditForm(profile || {})
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Sauvegarder via l'API OAuth pour tous les types d'utilisateurs
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          given_name: editForm.given_name,
          family_name: editForm.family_name,
          phone_number: editForm.phone_number,
          locale: editForm.locale,
          metadata: editForm.metadata
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde')
      }

      const { profile: updatedProfile } = await response.json()
      
      // Mettre à jour le profil avec les nouvelles données
      setProfile(updatedProfile)
      
      setEditing(false)
      toast.success('Profil mis à jour', 'Vos modifications ont été sauvegardées')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de sauvegarde'
      toast.error('Erreur de sauvegarde', errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setEditForm(prev => ({
        ...prev,
        [parent]: {
          ...((prev as any)[parent] || {}),
          [child]: value
        }
      }))
    } else {
      setEditForm(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" text="Chargement du profil..." />
        </div>
        <Footer />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <p className="text-red-600 mb-4">Erreur lors du chargement du profil</p>
            <button 
              onClick={loadProfile}
              className="bg-[#4FBA73] text-white px-4 py-2 rounded-lg hover:bg-[#3da562]"
            >
              Réessayer
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bouton retour à l'accueil */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-[#4FBA73] transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à l'accueil
          </Link>
        </div>
        {/* Header du profil moderne */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl mb-8">
          {/* Background avec pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#4FBA73] via-[#3da562] to-[#2d8f4f]">
            <div className="absolute inset-0 bg-black/10">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-48 -translate-y-48"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-40 translate-y-40"></div>
              </div>
            </div>
          </div>
          
          <div className="relative px-8 py-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-6 sm:space-y-0 sm:space-x-8">
                {/* Photo de profil avec badge */}
                <div className="relative">
                  <div className="relative">
                    <ProfilePictureUpload
                      userId={profile.sub}
                      currentPicture={profile.picture}
                      onPictureUpdate={(url) => {
                        setProfile(prev => prev ? {
                          ...prev,
                          picture: url
                        } : null)
                        setEditForm(prev => ({
                          ...prev,
                          picture: url
                        }))
                        updateUser({ picture: url })
                      }}
                      size="lg"
                    />
                    {profile.email_verified && (
                      <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2 shadow-lg border-4 border-white">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Informations principales */}
                <div className="text-white">
                  <div className="mb-4">
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.metadata?.organizationName || editForm.metadata?.clubName || editForm.name || ''}
                        onChange={(e) => handleInputChange(user?.user_type === 'club' ? 'metadata.clubName' : 'metadata.organizationName', e.target.value)}
                        className="bg-white/20 text-white placeholder-white/70 border-2 border-white/30 rounded-xl px-4 py-3 text-4xl font-bold backdrop-blur-sm focus:border-white/60 focus:outline-none transition-all"
                        placeholder={user?.user_type === 'club' ? 'Nom du club' : 'Nom de l\'organisation'}
                      />
                    ) : (
                      <h1 className="text-4xl lg:text-5xl font-bold mb-2 leading-tight">
                        {profile.metadata?.organizationName || profile.metadata?.clubName || profile.name || `${profile.given_name} ${profile.family_name}`.trim()}
                      </h1>
                    )}
                    
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.metadata?.league || ''}
                        onChange={(e) => handleInputChange('metadata.league', e.target.value)}
                        className="bg-white/20 text-white placeholder-white/70 border-2 border-white/30 rounded-lg px-3 py-2 backdrop-blur-sm focus:border-white/60 focus:outline-none transition-all"
                        placeholder={user?.user_type === 'club' ? 'Ligue/Division' : 'Type d\'organisation'}
                      />
                    ) : (
                      <p className="text-xl text-white/90 font-medium">
                        {profile.metadata?.league || (user?.user_type === 'club' ? 'Club de Football' : user?.user_type || 'Organisation')}
                      </p>
                    )}
                  </div>
                  
                  {/* Badges et informations */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">
                        Membre depuis {new Date(profile.created_at * 1000).toLocaleDateString('fr-FR', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    {(profile.metadata?.country || profile.locale) && (
                      <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">{profile.metadata?.country || profile.locale}</span>
                      </div>
                    )}
                    
                    {profile.metadata?.website && (
                      <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                        <Globe className="w-4 h-4 mr-2" />
                        <a href={profile.metadata.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline">
                          Site web
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center space-x-3">
                {editing ? (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCancel}
                      className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/30 hover:border-white/50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-white text-[#4FBA73] px-6 py-3 rounded-xl hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 font-semibold shadow-lg"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#4FBA73]"></div>
                      ) : (
                        <div className="flex items-center">
                          <Save className="w-5 h-5 mr-2" />
                          Sauvegarder
                        </div>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center backdrop-blur-sm border border-white/30 hover:border-white/50 font-semibold"
                  >
                    <Edit3 className="w-5 h-5 mr-2" />
                    Modifier le profil
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Informations principales */}
          <div className="xl:col-span-4 space-y-8">
            {/* Informations de contact */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-[#4FBA73] to-[#3da562] rounded-xl flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Informations de contact
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  {editing ? (
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  {editing ? (
                    <input
                      type="tel"
                      value={editForm.phone_number || ''}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                      placeholder="Numéro de téléphone"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <span>{profile.phone_number || 'Non renseigné'}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.metadata?.country || editForm.locale || ''}
                      onChange={(e) => handleInputChange('metadata.country', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                      placeholder="Pays"
                    />
                  ) : (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <span>{profile.metadata?.country || profile.locale || 'Non renseigné'}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site web</label>
                  {editing ? (
                    <input
                      type="url"
                      value={editForm.metadata?.website || ''}
                      onChange={(e) => handleInputChange('metadata.website', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                      placeholder="https://www.monclub.com"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 text-gray-400 mr-2" />
                      {profile.metadata?.website ? (
                        <a href={profile.metadata.website} target="_blank" rel="noopener noreferrer" className="text-[#4FBA73] hover:underline">
                          {profile.metadata.website}
                        </a>
                      ) : (
                        <span className="text-gray-500">Non renseigné</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Informations du club */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-[#4FBA73] to-[#3da562] rounded-xl flex items-center justify-center mr-4">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.user_type === 'club' ? 'Informations du club' : 'Informations de l\'organisation'}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stade</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.metadata?.stadium || ''}
                      onChange={(e) => handleInputChange('metadata.stadium', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                      placeholder="Nom du stade"
                    />
                  ) : (
                    <span>{profile.metadata?.stadium || 'Non renseigné'}</span>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacité</label>
                  {editing ? (
                    <input
                      type="number"
                      value={editForm.metadata?.capacity || ''}
                      onChange={(e) => handleInputChange('metadata.capacity', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                      placeholder="Nombre de places"
                    />
                  ) : (
                    <span>{profile.metadata?.capacity ? `${profile.metadata.capacity.toLocaleString()} places` : 'Non renseigné'}</span>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fondé en</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.metadata?.founded || ''}
                      onChange={(e) => handleInputChange('metadata.founded', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                      placeholder="Année de fondation"
                    />
                  ) : (
                    <span>{profile.metadata?.founded || 'Non renseigné'}</span>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Couleurs</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.metadata?.colors || ''}
                      onChange={(e) => handleInputChange('metadata.colors', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                      placeholder="Couleurs du club"
                    />
                  ) : (
                    <span>{profile.metadata?.colors || 'Non renseigné'}</span>
                  )}
                </div>
                
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Entraîneur principal</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.metadata?.coach || ''}
                      onChange={(e) => handleInputChange('metadata.coach', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                      placeholder="Nom de l'entraîneur"
                    />
                  ) : (
                    <span>{profile.metadata?.coach || 'Non renseigné'}</span>
                  )}
                </div>
                
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  {editing ? (
                    <textarea
                      value={editForm.metadata?.description || ''}
                      onChange={(e) => handleInputChange('metadata.description', e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73]"
                      placeholder="Description du club, histoire, valeurs..."
                    />
                  ) : (
                    <p className="text-gray-700">{profile.metadata?.description || 'Aucune description disponible'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar moderne */}
          <div className="space-y-8">
            {/* Statistiques */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">📊</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Statistiques</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Membre depuis</span>
                  <span className="font-medium">
                    {new Date(profile.created_at * 1000).toLocaleDateString('fr-FR', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Statut</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    profile.email_verified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {profile.email_verified ? 'Vérifié' : 'En attente'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-[#4FBA73] hover:bg-[#3da562] text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Voir le dashboard
                </button>
                <Link href="/dashboard" className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg transition-colors text-center block">
                  Gérer les joueurs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}