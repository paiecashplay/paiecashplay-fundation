import { NextRequest, NextResponse } from 'next/server'
import { getOAuthConfig,getCurrentUser } from '@/lib/auth';

class PaieCashAuthAPI {
  constructor(private baseUrl: string, private accessToken?: string) {}

  async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(options.headers as Record<string, string>)
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      const errorText = await response.text()
      if (response.status === 401) {
        throw new Error('TOKEN_EXPIRED')
      }
      
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText }
      }
      
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`)
    }

    return response.json()
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    if (user.user_type !== 'club') {
      return NextResponse.json(
        { error: 'Accès réservé aux clubs' },
        { status: 403 }
      )
    }

    const api = new PaieCashAuthAPI(getOAuthConfig().issuer, user.access_token)
    
    try {
      // Récupérer les membres du club depuis l'API OAuth
      const membersResult = await api.makeRequest(`/api/oauth/clubs/${user.sub}/members`)
      const members = membersResult.members || []

      // Calculer les statistiques
      const totalMembers = members.length
      
      // Compter par position
      const membersByPosition = {
        goalkeeper: members.filter((m: any) => m.metadata?.position === 'goalkeeper').length,
        defender: members.filter((m: any) => m.metadata?.position === 'defender').length,
        midfielder: members.filter((m: any) => m.metadata?.position === 'midfielder').length,
        forward: members.filter((m: any) => m.metadata?.position === 'forward').length
      }

      // Compter par statut (tous actifs par défaut)
      const membersByStatus = {
        active: members.filter((m: any) => m.metadata?.status === 'active' || !m.metadata?.status).length,
        injured: members.filter((m: any) => m.metadata?.status === 'injured').length,
        suspended: members.filter((m: any) => m.metadata?.status === 'suspended').length
      }

      // Calculer l'âge moyen
      const membersWithAge = members.filter((m: any) => m.metadata?.birthDate)
      const averageAge = membersWithAge.length > 0 
        ? membersWithAge.reduce((sum: number, m: any) => {
            const age = new Date().getFullYear() - new Date(m.metadata.birthDate).getFullYear()
            return sum + age
          }, 0) / membersWithAge.length
        : 0

      const stats = {
        totalMembers,
        membersByPosition,
        membersByStatus,
        averageAge: Math.round(averageAge)
      }

      return NextResponse.json({
        success: true,
        data: stats
      })

    } catch (error) {
      if (error instanceof Error && error.message === 'TOKEN_EXPIRED') {
        return NextResponse.json(
          { error: 'Session expirée, veuillez vous reconnecter' },
          { status: 401 }
        )
      }
      throw error
    }

  } catch (error) {
    console.error('Erreur récupération stats club:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Erreur serveur'
      },
      { status: 500 }
    )
  }
}