import { getOAuthConfig, getCurrentUser } from '@/lib/auth';

export interface ClubMember {
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
    contractUntil?: string
  }
}

export interface ClubStats {
  totalMembers: number
  membersByPosition: {
    goalkeeper: number
    defender: number
    midfielder: number
    forward: number
  }
  membersByStatus: {
    active: number
    injured: number
    suspended: number
  }
  averageAge: number
}

class PaieCashAuthAPI {
  constructor(private baseUrl: string, private accessToken?: string) {}

  setAccessToken(token: string) {
    this.accessToken = token
  }

  async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(options.headers as Record<string, string>)
    }

    // Ajouter le Bearer token pour les endpoints OAuth
    if (this.accessToken && endpoint.startsWith('/api/oauth')) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    console.log(`🔄 API Call: ${options.method || 'GET'} ${url}`)
    console.log('📋 Headers:', headers)
    if (this.accessToken) {
      console.log(`🔑 Token: ${this.accessToken.substring(0, 20)}...`)
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ API Error ${response.status}:`, errorText)
      
      // Gestion spéciale des tokens expirés
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

    const result = await response.json()
    console.log('✅ API Success:', result)
    return result
  }
}

export async function getClubMembers(clubId: string): Promise<ClubMember[]> {
  const user = await getCurrentUser()
  if (!user?.access_token) {
    throw new Error('Non authentifié')
  }

  // Utiliser directement l'ID du club depuis l'utilisateur connecté
  const userClubId = user.sub
  
  const api = new PaieCashAuthAPI(getOAuthConfig().issuer, user.access_token)
  
  try {
    const result = await api.makeRequest(`/api/oauth/clubs/${userClubId}/members`)
    return result.members || []
  } catch (error) {
    if (error instanceof Error && error.message === 'TOKEN_EXPIRED') {
      throw new Error('Session expirée, veuillez vous reconnecter')
    }
    throw error
  }
}

export async function addClubMember(user: any, memberData: {
  email?: string
  password?: string
  firstName: string
  lastName: string
  country: string
  phone?: string
  metadata?: {
    position?: string
    licenseNumber?: string
    height?: string
    weight?: string
    birthDate?: string
  }
}): Promise<ClubMember> {
  if (!user?.access_token) {
    throw new Error('Non authentifié')
  }

  // Vérifier que l'utilisateur est bien un club
  if (user.user_type !== 'club') {
    throw new Error('Seuls les clubs peuvent ajouter des membres')
  }

  // L'utilisateur connecté est le club lui-même (user.sub = club ID)
  const userClubId = user.sub
  
  const api = new PaieCashAuthAPI(getOAuthConfig().issuer, user.access_token)
  
  try {
    console.log('📝 Données membre à ajouter:', memberData)
    console.log('🏢 Club ID utilisé:', userClubId)
    console.log('👤 Type utilisateur:', user.user_type)
    
    // Le membre ajouté sera automatiquement de type 'player'
    const memberWithType = {
      ...memberData,
      userType: 'player'
    }
    
    const result = await api.makeRequest(`/api/oauth/clubs/${userClubId}/members`, {
      method: 'POST',
      body: JSON.stringify(memberWithType)
    })
    
    return result.member
  } catch (error) {
    if (error instanceof Error && error.message === 'TOKEN_EXPIRED') {
      throw new Error('Session expirée, veuillez vous reconnecter')
    }
    throw error
  }
}

export async function updateClubMember(user: any, memberId: string, memberData: Partial<ClubMember>): Promise<ClubMember> {
  if (!user?.access_token) {
    throw new Error('Non authentifié')
  }

  if (user.user_type !== 'club') {
    throw new Error('Seuls les clubs peuvent modifier des membres')
  }

  const userClubId = user.sub
  const api = new PaieCashAuthAPI(getOAuthConfig().issuer, user.access_token)
  
  try {
    const result = await api.makeRequest(`/api/oauth/clubs/${userClubId}/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify(memberData)
    })
    
    return result.member
  } catch (error) {
    if (error instanceof Error && error.message === 'TOKEN_EXPIRED') {
      throw new Error('Session expirée, veuillez vous reconnecter')
    }
    throw error
  }
}

export async function deleteClubMember(user: any, memberId: string): Promise<void> {
  if (!user?.access_token) {
    throw new Error('Non authentifié')
  }

  if (user.user_type !== 'club') {
    throw new Error('Seuls les clubs peuvent supprimer des membres')
  }

  const userClubId = user.sub
  const api = new PaieCashAuthAPI(getOAuthConfig().issuer, user.access_token)
  
  try {
    await api.makeRequest(`/api/oauth/clubs/${userClubId}/members/${memberId}`, {
      method: 'DELETE'
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'TOKEN_EXPIRED') {
      throw new Error('Session expirée, veuillez vous reconnecter')
    }
    throw error
  }
}



export async function getClubStats(clubId: string): Promise<ClubStats> {
  const user = await getCurrentUser()
  if (!user?.access_token) {
    throw new Error('Non authentifié')
  }

  // Utiliser directement l'ID du club depuis l'utilisateur connecté
  const userClubId = user.sub
  
  const api = new PaieCashAuthAPI(getOAuthConfig().issuer, user.access_token)
  
  try {
    const result = await api.makeRequest(`/api/oauth/stats/clubs/${userClubId}`)
    return result.statistics
  } catch (error) {
    if (error instanceof Error && error.message === 'TOKEN_EXPIRED') {
      throw new Error('Session expirée, veuillez vous reconnecter')
    }
    throw error
  }
}