import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

const getOAuthBaseUrl = () => {
  return process.env.OAUTH_ISSUER || 'http://localhost:3000'
}

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

    if (this.accessToken && endpoint.startsWith('/api/oauth')) {
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

    const api = new PaieCashAuthAPI(getOAuthBaseUrl(), user.access_token)
    
    try {
      const result = await api.makeRequest(`/api/oauth/users/${user.sub}`)
      
      return NextResponse.json({
        success: true,
        data: result.user
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
    console.error('Erreur récupération profil club:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Erreur serveur'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const updateData = await request.json()
    const api = new PaieCashAuthAPI(getOAuthBaseUrl(), user.access_token)
    
    try {
      const result = await api.makeRequest(`/api/oauth/users/${user.sub}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      })
      
      return NextResponse.json({
        success: true,
        data: result.user
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
    console.error('Erreur mise à jour profil club:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Erreur serveur'
      },
      { status: 500 }
    )
  }
}