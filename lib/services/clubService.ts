import { getOAuthConfig } from '@/lib/auth'

export interface Club {
  id: string
  name: string
  country?: string
  league?: string
}

export async function getClubsList(accessToken?: string): Promise<Club[]> {
  try {
    const config = getOAuthConfig()
    const response = await fetch(`${config.issuer}/api/public/clubs`, {
      headers: {
        'Accept': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
      }
    })

    if (!response.ok) {
      console.warn('Impossible de récupérer la liste des clubs')
      return []
    }

    const result = await response.json()
    return result.clubs || []
  } catch (error) {
    console.error('Erreur lors de la récupération des clubs:', error)
    return []
  }
}