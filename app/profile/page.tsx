'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useToastContext } from '@/components/ToastProvider'
import { User, Mail, Phone, MapPin, Calendar, Trophy, Edit3, Save, X, Building, Users, Globe, Shield } from 'lucide-react'

interface ClubProfile {
  sub: string
  email: string
  email_verified: boolean
  name: string
  given_name: string
  family_name: string
  phone_number?: string
  locale: string
  user_type: string
  is_active: boolean
  created_at: number
  updated_at: number
  metadata?: {
    clubName?: string
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
  const { user, loading: authLoading } = useAuth()
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

    if (user.user_type !== 'club') {
      toast.error('Accès refusé', 'Cette page est réservée aux clubs')
      router.push('/dashboard')
      return
    }

    loadProfile()
  }, [user, authLoading])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/profile/club')
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du profil')
      }
      
      const { data } = await response.json()
      setProfile(data)
      setEditForm(data)
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
      const response = await fetch('/api/profile/club', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde')
      }

      const { data } = await response.json()
      setProfile(data)
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header du profil */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#4FBA73] to-[#3da562] px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mr-6">
                  <Building className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.metadata?.clubName || editForm.name || ''}
                        onChange={(e) => handleInputChange('metadata.clubName', e.target.value)}
                        className="bg-white/20 text-white placeholder-white/70 border-white/30 rounded-lg px-3 py-1 text-3xl font-bold"
                        placeholder="Nom du club"
                      />
                    ) : (
                      profile.metadata?.clubName || profile.name
                    )}
                  </h1>
                  <p className="text-white/80 text-lg mt-1">
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.metadata?.league || ''}
                        onChange={(e) => handleInputChange('metadata.league', e.target.value)}
                        className="bg-white/20 text-white placeholder-white/70 border-white/30 rounded-lg px-3 py-1"
                        placeholder="Ligue/Division"
                      />
                    ) : (
                      profile.metadata?.league || 'Club de Football'
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {profile.email_verified && (
                  <div className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                    <Shield className="w-4 h-4 text-white mr-2" />
                    <span className="text-white text-sm">Vérifié</span>
                  </div>
                )}
                
                {editing ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-white text-[#4FBA73] px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4FBA73]"></div>
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Modifier
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-8">
            {/* Informations de contact */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <User className="w-5 h-5 mr-3 text-[#4FBA73]" />
                Informations de contact
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      value={editForm.metadata?.country || ''}
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
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Trophy className="w-5 h-5 mr-3 text-[#4FBA73]" />
                Informations du club
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                
                <div className="md:col-span-2">
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
                
                <div className="md:col-span-2">
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistiques */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Statistiques</h3>
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
                <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg transition-colors">
                  Gérer les joueurs
                </button>
                <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg transition-colors">
                  Historique des dons
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}