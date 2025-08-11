'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Download, Mail, Phone, MapPin, Calendar, Trophy, Gift, FileText, User, Shield, Activity, Star, TrendingUp, Award, CheckCircle } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'
import UserDropdown from '@/components/UserDropdown'
import { useToastContext } from '@/components/ToastProvider'
import Image from 'next/image'
import Link from 'next/link'

interface PlayerDetails {
  id: string
  email: string
  firstName: string
  lastName: string
  country: string
  phone?: string
  isVerified: boolean
  createdAt: string
  metadata?: {
    position?: string
    licenseNumber?: string
    jerseyNumber?: string
    birthDate?: string
    height?: string
    weight?: string
    status?: 'active' | 'injured' | 'suspended'
  }
  license?: {
    id: string
    packName: string
    issuedAt: string
    expiresAt: string
    downloadUrl: string
  }
  donations: {
    total: number
    count: number
    recent: Array<{
      id: string
      amount: number
      date: string
      donor: string
    }>
  }
}

export default function PlayerPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToastContext()
  const [player, setPlayer] = useState<PlayerDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && params.id) {
      loadPlayerDetails()
    }
  }, [user, params.id])

  const loadPlayerDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/players/${params.id}`)
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du joueur')
      }
      
      const result = await response.json()
      
      if (result.success) {
        setPlayer(result.data)
        toast.success('Profil chargé', 'Informations du joueur récupérées')
      } else {
        throw new Error(result.error || 'Erreur de chargement')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement'
      setError(errorMessage)
      toast.error('Erreur de chargement', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadLicense = async () => {
    if (!player?.license) {
      toast.warning('Aucune licence', 'Ce joueur n\'a pas encore de licence active')
      return
    }
    
    try {
      toast.info('Téléchargement', 'Préparation du fichier PDF...')
      const response = await fetch(player.license.downloadUrl)
      
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `license-${player.firstName || 'joueur'}-${player.lastName || 'inconnu'}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Téléchargement réussi', 'La licence a été téléchargée')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de téléchargement'
      toast.error('Erreur de téléchargement', errorMessage)
      console.error('Erreur téléchargement:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="Chargement du profil..." />
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Joueur non trouvé'}</p>
          <Button onClick={() => router.back()}>Retour</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header amélioré */}
      <div className="relative bg-gradient-to-r from-[#4FBA73] via-[#4FBA73] to-[#3da562] shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <Image
                  src="/logo.png"
                  alt="PaieCash Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </Link>
              <Button
                onClick={() => router.back()}
                variant="ghost"
                className="text-white hover:bg-white/20 backdrop-blur-sm border border-white/20"
                size="lg"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour au dashboard
              </Button>
            </div>
            <UserDropdown />
          </div>
          
          <div className="pb-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-center mb-6 lg:mb-0">
                <div className="relative">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mr-8 border border-white/30 shadow-2xl">
                    <span className="text-white font-bold text-2xl">
                      {player.firstName?.[0] || 'P'}{player.lastName?.[0] || 'J'}
                    </span>
                  </div>
                  {player.isVerified && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                    {player.firstName || 'Prénom'} {player.lastName || 'Nom'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    {player.metadata?.position && (
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2 text-sm font-semibold">
                        <Trophy className="w-4 h-4 mr-2" />
                        {player.metadata.position}
                      </Badge>
                    )}
                    {player.metadata?.jerseyNumber && (
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2 text-sm font-semibold">
                        <Shield className="w-4 h-4 mr-2" />
                        #{player.metadata.jerseyNumber}
                      </Badge>
                    )}
                    {player.metadata?.status && (
                      <Badge className={`${
                        player.metadata.status === 'active' 
                          ? 'bg-green-500/20 text-green-100 border-green-400/30' 
                          : 'bg-red-500/20 text-red-100 border-red-400/30'
                      } backdrop-blur-sm px-4 py-2 text-sm font-semibold capitalize`}>
                        <Activity className="w-4 h-4 mr-2" />
                        {player.metadata.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {player.donations?.total || 0}€
                  </div>
                  <div className="text-green-100 text-sm font-medium">Total donations</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {player.donations?.count || 0}
                  </div>
                  <div className="text-green-100 text-sm font-medium">Donateurs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations personnelles améliorées */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                <CardTitle className="flex items-center text-xl">
                  <User className="w-6 h-6 mr-3 text-blue-600" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 font-medium">Email</div>
                      <div className="font-semibold">{player.email}</div>
                    </div>
                  </div>
                  
                  {player.phone && (
                    <div className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 font-medium">Téléphone</div>
                        <div className="font-semibold">{player.phone}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 font-medium">Pays</div>
                      <div className="font-semibold">{player.country}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 font-medium">Inscription</div>
                      <div className="font-semibold">{new Date(player.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
                
                {player.metadata && (
                  <>
                    <Separator className="my-8" />
                    <div>
                      <h4 className="text-lg font-bold mb-6 flex items-center">
                        <Trophy className="w-5 h-5 mr-2 text-[#4FBA73]" />
                        Informations sportives
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {player.metadata.birthDate && (
                          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                            <div className="text-2xl font-bold text-blue-600 mb-1">
                              {new Date().getFullYear() - new Date(player.metadata.birthDate).getFullYear()}
                            </div>
                            <div className="text-xs text-blue-600 font-medium">ans</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Né le {new Date(player.metadata.birthDate).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                        {player.metadata.height && (
                          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                            <div className="text-2xl font-bold text-green-600 mb-1">
                              {player.metadata.height}
                            </div>
                            <div className="text-xs text-green-600 font-medium">cm</div>
                            <div className="text-xs text-gray-500 mt-1">Taille</div>
                          </div>
                        )}
                        {player.metadata.weight && (
                          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                            <div className="text-2xl font-bold text-purple-600 mb-1">
                              {player.metadata.weight}
                            </div>
                            <div className="text-xs text-purple-600 font-medium">kg</div>
                            <div className="text-xs text-gray-500 mt-1">Poids</div>
                          </div>
                        )}
                        {player.metadata.status && (
                          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                            <div className={`text-2xl font-bold mb-1 ${
                              player.metadata.status === 'active' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              <Activity className="w-6 h-6 mx-auto" />
                            </div>
                            <div className={`text-xs font-medium capitalize ${
                              player.metadata.status === 'active' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {player.metadata.status}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Statut</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Donations récentes améliorées */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl">
                <CardTitle className="flex items-center text-xl">
                  <Gift className="w-6 h-6 mr-3 text-green-600" />
                  Donations reçues
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 bg-gradient-to-br from-[#4FBA73]/10 to-[#3da562]/20 rounded-2xl border border-[#4FBA73]/20">
                    <div className="w-12 h-12 bg-[#4FBA73] rounded-xl flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-[#4FBA73] mb-1">
                      {player.donations?.total || 0}€
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Total reçu</div>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {player.donations?.count || 0}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Donations</div>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {player.donations?.count ? Math.round((player.donations.total || 0) / player.donations.count) : 0}€
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Moyenne</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-bold flex items-center">
                    <Gift className="w-5 h-5 mr-2 text-[#4FBA73]" />
                    Donations récentes
                  </h4>
                  {player.donations?.recent?.length > 0 ? (
                    <div className="space-y-3">
                      {player.donations.recent.map((donation) => (
                        <div key={donation.id} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border border-gray-200">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-[#4FBA73] rounded-lg flex items-center justify-center mr-4">
                              <Gift className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{donation.donor}</p>
                              <p className="text-sm text-gray-500">{new Date(donation.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-[#4FBA73]">
                              {donation.amount}€
                            </div>
                            <div className="text-xs text-gray-500">Donation</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Gift className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">Aucune donation reçue</p>
                      <p className="text-sm text-gray-400 mt-1">Les donations apparaîtront ici</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* License améliorée */}
          <div className="space-y-8">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-t-xl">
                <CardTitle className="flex items-center text-xl">
                  <FileText className="w-6 h-6 mr-3 text-amber-600" />
                  License active
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {player.license ? (
                  <div className="space-y-6">
                    <div className="relative p-6 bg-gradient-to-br from-[#4FBA73]/10 via-[#4FBA73]/5 to-[#3da562]/10 rounded-2xl border-2 border-[#4FBA73]/20 overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#4FBA73]/10 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="relative">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-[#4FBA73] rounded-xl flex items-center justify-center mr-4">
                            <Award className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{player.license.packName}</h3>
                            <p className="text-sm text-gray-600">Pack de donation actif</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center p-3 bg-white/60 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">Émission</div>
                            <div className="font-semibold text-gray-900">
                              {new Date(player.license.issuedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-white/60 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">Expiration</div>
                            <div className="font-semibold text-gray-900">
                              {new Date(player.license.expiresAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-800">License valide</span>
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            Active
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleDownloadLicense}
                      className="w-full bg-gradient-to-r from-[#4FBA73] to-[#3da562] hover:from-[#3da562] hover:to-[#2d8f4f] shadow-lg hover:shadow-xl transition-all duration-300"
                      size="lg"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Télécharger la license PDF
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Aucune license assignée</h3>
                    <p className="text-gray-500 text-sm">La license apparaîtra automatiquement lors de la première donation</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Statistiques rapides */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-xl">
                <CardTitle className="flex items-center text-xl">
                  <TrendingUp className="w-6 h-6 mr-3 text-indigo-600" />
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="font-medium text-gray-900">Membre depuis</span>
                    </div>
                    <span className="font-bold text-blue-600">
                      {Math.floor((Date.now() - new Date(player.createdAt).getTime()) / (1000 * 60 * 60 * 24))} jours
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                      <span className="font-medium text-gray-900">Statut compte</span>
                    </div>
                    <Badge className={`${
                      player.isVerified 
                        ? 'bg-green-100 text-green-800 border-green-300' 
                        : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                    }`}>
                      {player.isVerified ? 'Vérifié' : 'En attente'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}