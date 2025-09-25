import { getOAuthConfig } from '@/lib/auth';

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

export async function markUserAsDonor(userId: string, donorData: {
  totalDonated: number
  preferredCauses?: string[]
  donorSince?: string
}, user: any, toast?: any) {
  if (!user?.access_token) {
    const error = 'Token d\'accès manquant'
    console.log('Token d\'accès manquant, impossible de marquer comme donateur')
    throw new Error(error)
  }

  const api = new PaieCashAuthAPI(getOAuthConfig().issuer, user.access_token)
  
  try {
    const result = await api.makeRequest(`/api/oauth/users/${userId}/donor`, {
      method: 'POST',
      body: JSON.stringify({
        totalDonated: donorData.totalDonated,
        preferredCauses: donorData.preferredCauses || ['youth_development'],
        donorSince: donorData.donorSince || new Date().toISOString()
      })
    })
    
    toast?.success('Statut donateur activé', 'Vous êtes maintenant reconnu comme donateur')
    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    if (errorMessage === 'TOKEN_EXPIRED') {
      toast?.error('Session expirée', 'Veuillez vous reconnecter')
      throw new Error('Session expirée, veuillez vous reconnecter')
    }
    toast?.error('Erreur lors de l\'activation', errorMessage)
    throw error
  }
}

export async function checkUserDonorStatus(userId: string) {
  try {
    const response = await fetch(`${getOAuthConfig().issuer}/api/public/players`)
    const result = await response.json()
    
    const user = result.players?.find((p: any) => p.id === userId)
    return {
      isDonor: user?.metadata?.isDonor || false,
      totalDonated: user?.metadata?.totalDonated || 0
    }
  } catch (error) {
    console.error('Erreur vérification statut donateur:', error)
    return { isDonor: false, totalDonated: 0 }
  }
}