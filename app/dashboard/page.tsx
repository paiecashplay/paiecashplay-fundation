'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface ClubMember {
  id: string
  firstName: string
  lastName: string
  email: string
  metadata?: {
    position?: string
    jerseyNumber?: number
    status?: string
  }
}

interface ClubStats {
  totalMembers: number
  membersByStatus?: {
    active?: number
    injured?: number
    suspended?: number
  }
  averageAge?: number
  membersByPosition?: {
    forward?: number
    defender?: number
    midfielder?: number
    goalkeeper?: number
  }
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Users, UserPlus, TrendingUp, Activity, Shield, Calendar, Mail, Phone, MapPin, Star, Trophy, Target, Trash2 } from 'lucide-react'
import AddMemberModal from '@/components/club/AddMemberModal'
import DeleteMemberModal from '@/components/club/DeleteMemberModal'
import LoadingSpinner from '@/components/LoadingSpinner'
import UserDropdown from '@/components/UserDropdown'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useToastContext } from '@/components/ToastProvider'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [members, setMembers] = useState<ClubMember[]>([])
  const [stats, setStats] = useState<ClubStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<ClubMember | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToastContext()

  useEffect(() => {
    if (user && user.user_type === 'club') {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [membersResponse, statsResponse] = await Promise.all([
        fetch('/api/club/members'),
        fetch('/api/club/stats')
      ])
      
      if (membersResponse.ok) {
        const { data: membersData } = await membersResponse.json()
        setMembers(membersData)
      } else {
        toast.error('Erreur membres', 'Impossible de charger les membres')
      }
      
      if (statsResponse.ok) {
        const { data: statsData } = await statsResponse.json()
        setStats(statsData)
      } else {
        toast.error('Erreur statistiques', 'Impossible de charger les statistiques')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement'
      setError(errorMessage)
      toast.error('Erreur de chargement', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (memberData: any) => {
    try {
      const response = await fetch('/api/club/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(memberData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de l\'ajout')
      }

      const { data: newMember } = await response.json()
      setMembers(prev => [...prev, newMember])
      setIsAddModalOpen(false)
      toast.success('Joueur ajouté', `${newMember.firstName} ${newMember.lastName} a été ajouté à l'équipe`)
      // Recharger les stats
      loadDashboardData()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout'
      toast.error('Erreur ajout joueur', errorMessage)
      throw err // Laisse le modal gérer l'erreur
    }
  }

  const handleMemberClick = (member: ClubMember) => {
    router.push(`/player/${member.id}`)
  }

  const handleDeleteClick = (member: ClubMember) => {
    setMemberToDelete(member)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/club/members/${memberId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la suppression')
      }
      setMembers(prev => prev.filter(m => m.id !== memberId))
      toast.success('Joueur supprimé', 'Le joueur a été supprimé de l\'équipe')
      // Recharger les stats
      loadDashboardData()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      setError(errorMessage)
      toast.error('Erreur suppression', errorMessage)
      throw err
    }
  }

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    )
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/api/auth/login'
    }
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full mx-4">
          <p className="text-center text-gray-600">Redirection vers la connexion...</p>
        </div>
      </div>
    )
  }

  if (user.user_type !== 'club') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full mx-4">
          <p className="text-center text-gray-600">Accès réservé aux clubs</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header avec gradient PaieCash */}
      <div className="bg-gradient-to-r from-[#4FBA73] via-[#4FBA73] to-[#3da562] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              <Image
                src="/logo.png"
                alt="PaieCash Logo"
                width={48}
                height={48}
                className="w-12 h-12"
              />
              <div>
                <h1 className="text-3xl font-bold text-white">Dashboard Club</h1>
                <p className="text-green-100 mt-1 text-lg">Gérez votre équipe et suivez vos performances</p>
              </div>
            </div>
            <UserDropdown />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl shadow-sm">
            <p className="text-red-700 font-medium">{error}</p>
            <Button onClick={loadDashboardData} className="mt-4 bg-red-600 hover:bg-red-700" size="sm">
              Réessayer
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" text="Chargement du dashboard..." />
          </div>
        ) : (
          <>
            {/* Statistiques avec thème PaieCash */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Membres</p>
                      <p className="text-4xl font-bold text-gray-900 mt-3">{stats.totalMembers || 0}</p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-[#4FBA73] to-[#3da562] rounded-2xl flex items-center justify-center shadow-lg">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Joueurs Actifs</p>
                      <p className="text-4xl font-bold text-[#4FBA73] mt-3">{stats.membersByStatus?.active || 0}</p>
                      <p className="text-xs text-gray-500 mt-2 flex items-center">
                        <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                        {stats.membersByStatus?.injured || 0} blessés • {stats.membersByStatus?.suspended || 0} suspendus
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Activity className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Âge Moyen</p>
                      <p className="text-4xl font-bold text-purple-600 mt-3">{stats.averageAge?.toFixed(1) || '0'} ans</p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Formation</p>
                      <p className="text-4xl font-bold text-orange-600 mt-3">{stats.membersByPosition?.forward || 0}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        ATT • {stats.membersByPosition?.defender || 0} DEF • {stats.membersByPosition?.midfielder || 0} MIL • {stats.membersByPosition?.goalkeeper || 0} GB
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contenu principal avec design PaieCash */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Liste des membres */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                          <Trophy className="h-6 w-6 text-[#4FBA73] mr-3" />
                          Équipe
                        </h2>
                        <p className="text-gray-600 mt-1">{members.length} joueur{members.length > 1 ? 's' : ''} enregistré{members.length > 1 ? 's' : ''}</p>
                      </div>
                      <Button 
                        onClick={() => setIsAddModalOpen(true)} 
                        className="bg-gradient-to-r from-[#4FBA73] to-[#3da562] hover:from-[#3da562] hover:to-[#2d8f4f] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        size="lg"
                      >
                        <UserPlus className="h-5 w-5 mr-2" />
                        Ajouter un joueur
                      </Button>
                    </div>
                  </div>

                  <div className="p-8">
                    {members.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Users className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Aucun membre dans votre équipe</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">Commencez par ajouter des joueurs pour gérer votre équipe et suivre leurs performances</p>
                        <Button 
                          onClick={() => setIsAddModalOpen(true)} 
                          className="bg-gradient-to-r from-[#4FBA73] to-[#3da562] hover:from-[#3da562] hover:to-[#2d8f4f] text-white shadow-lg"
                          size="lg"
                        >
                          <UserPlus className="h-5 w-5 mr-2" />
                          Ajouter le premier joueur
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {members.map((member, index) => (
                          <div key={member.id} className="group flex items-center justify-between p-6 border border-gray-100 rounded-2xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-white hover:shadow-md transition-all duration-300">
                            <div 
                              className="flex items-center space-x-6 flex-1 cursor-pointer"
                              onClick={() => handleMemberClick(member)}
                            >
                              <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#4FBA73] to-[#3da562] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                  <span className="text-white font-bold text-lg">
                                    {member.firstName[0]}{member.lastName[0]}
                                  </span>
                                </div>
                                {member.metadata?.status === 'active' && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">{member.firstName} {member.lastName}</h3>
                                <div className="flex items-center space-x-4 mt-2">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                    {member.email}
                                  </div>
                                  {member.metadata?.position && (
                                    <Badge className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300">
                                      {member.metadata.position}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-6">
                              {member.metadata?.jerseyNumber && (
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-[#4FBA73]">
                                    #{member.metadata.jerseyNumber}
                                  </div>
                                  <div className="text-xs text-gray-500">Maillot</div>
                                </div>
                              )}
                              {member.metadata?.status && (
                                <Badge 
                                  className={`${
                                    member.metadata.status === 'active' 
                                      ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300' 
                                      : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300'
                                  } capitalize font-medium`}
                                >
                                  {member.metadata.status}
                                </Badge>
                              )}
                              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 border-red-300 hover:bg-red-50 hover:border-red-400"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteClick(member)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar avec thème PaieCash */}
              <div className="space-y-8">
                {/* Licences */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 mr-3" />
                      Licences Actives
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">Suivi des donations</p>
                  </div>
                  <div className="p-6">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-8 w-8 text-yellow-600" />
                      </div>
                      <p className="text-gray-600 font-medium mb-2">Aucune licence active</p>
                      <p className="text-xs text-gray-500">
                        Les licences apparaîtront automatiquement lors des donations
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions rapides avec design PaieCash */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-[#4FBA73]/10 to-[#3da562]/10 px-6 py-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                      <Target className="h-5 w-5 text-[#4FBA73] mr-3" />
                      Actions Rapides
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left hover:bg-gradient-to-r hover:from-[#4FBA73]/5 hover:to-[#3da562]/5 hover:border-[#4FBA73] transition-all duration-300" 
                      onClick={() => setIsAddModalOpen(true)}
                      size="lg"
                    >
                      <UserPlus className="h-5 w-5 mr-3 text-[#4FBA73]" />
                      <span className="font-medium">Ajouter un joueur</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 hover:border-purple-300 transition-all duration-300"
                      size="lg"
                    >
                      <TrendingUp className="h-5 w-5 mr-3 text-purple-600" />
                      <span className="font-medium">Voir les statistiques</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-blue-300 transition-all duration-300"
                      size="lg"
                    >
                      <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                      <span className="font-medium">Gérer les licences</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddMember}
      />
      
      <DeleteMemberModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setMemberToDelete(null)
        }}
        onDelete={handleDeleteMember}
        member={memberToDelete}
      />
    </div>
  )
}