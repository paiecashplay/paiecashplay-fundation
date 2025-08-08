import { prisma } from '@/lib/prisma'

export interface ClubMember {
  id: string
  email: string
  firstName: string
  lastName: string
  userType: string
  country: string
  phone: string
  metadata?: {
    position?: string
    licenseNumber?: string
    age?: number
    [key: string]: any
  }
  createdAt: string
  updatedAt: string
}

export interface ClubLicence {
  id: string
  numero_licence: string
  joueur_oauth_id: string
  pack_donation_id: string
  date_emission: Date
  date_expiration: Date
  statut: string
  montant_paye: number
  pack: {
    nom: string
    code: string
  }
}

// Récupérer les membres du club depuis le service OAuth
export async function getClubMembers(clubOAuthId: string, accessToken: string): Promise<ClubMember[]> {
  try {
    const response = await fetch(`${process.env.OAUTH_ISSUER}/api/oauth/clubs/${clubOAuthId}/members`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch club members')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching club members:', error)
    return []
  }
}

// Ajouter un membre au club via le service OAuth
export async function addClubMember(clubOAuthId: string, accessToken: string, memberData: {
  email: string
  given_name: string
  family_name: string
  metadata?: any
}): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.OAUTH_ISSUER}/api/oauth/clubs/${clubOAuthId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        email: memberData.email,
        password: 'temp123456', // Mot de passe temporaire
        firstName: memberData.given_name,
        lastName: memberData.family_name,
        country: 'FR', // Par défaut
        phone: '',
        metadata: memberData.metadata || {}
      })
    })
    
    return response.ok
  } catch (error) {
    console.error('Error adding club member:', error)
    return false
  }
}

// Mettre à jour un membre du club
export async function updateClubMember(memberOAuthId: string, accessToken: string, memberData: {
  given_name?: string
  family_name?: string
  email?: string
  metadata?: any
}): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.OAUTH_ISSUER}/api/oauth/users/${memberOAuthId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        firstName: memberData.given_name,
        lastName: memberData.family_name,
        email: memberData.email,
        metadata: memberData.metadata
      })
    })
    
    return response.ok
  } catch (error) {
    console.error('Error updating club member:', error)
    return false
  }
}

// Récupérer les licences du club
export async function getClubLicences(clubOAuthId: string): Promise<ClubLicence[]> {
  return await prisma.licence.findMany({
    where: { club_oauth_id: clubOAuthId },
    include: {
      pack: {
        select: {
          nom: true,
          code: true
        }
      }
    },
    orderBy: { created_at: 'desc' }
  })
}

// Créer une licence pour un joueur
export async function createLicence(licenceData: {
  joueur_oauth_id: string
  club_oauth_id: string
  pack_donation_id: string
  montant_paye: number
  date_expiration: Date
}): Promise<string | null> {
  try {
    const numeroLicence = `LIC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const licence = await prisma.licence.create({
      data: {
        numero_licence: numeroLicence,
        ...licenceData
      }
    })
    
    return licence.id
  } catch (error) {
    console.error('Error creating licence:', error)
    return null
  }
}

// Récupérer les joueurs d'un club
export async function getClubPlayers(clubOAuthId: string, accessToken: string): Promise<ClubMember[]> {
  try {
    const response = await fetch(`${process.env.OAUTH_ISSUER}/api/oauth/players?club_id=${clubOAuthId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch club players')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching club players:', error)
    return []
  }
}

// Statistiques du club
export async function getClubStats(clubOAuthId: string, accessToken: string) {
  const [totalLicences, activeLicences, totalMembers] = await Promise.all([
    prisma.licence.count({
      where: { club_oauth_id: clubOAuthId }
    }),
    prisma.licence.count({
      where: { 
        club_oauth_id: clubOAuthId,
        statut: 'active'
      }
    }),
    getClubMembers(clubOAuthId, accessToken).then(members => members.length)
  ])
  
  return {
    totalMembers,
    totalLicences,
    activeLicences,
    expiredLicences: totalLicences - activeLicences
  }
}