import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export interface LicenceData {
  id: string
  numero_licence: string
  joueur_oauth_id: string
  club_oauth_id: string
  pack_donation_id: string
  date_emission: Date
  date_expiration: Date
  statut: string
  montant_paye: number
  devise: string
  pack: {
    nom: string
    code: string
    prix: number
  }
}

export async function createLicence(data: {
  joueur_oauth_id: string
  pack_donation_id: string
  montant_paye: number
  duree_mois?: number
}): Promise<LicenceData> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Non authentifié')
  }

  // Récupérer les informations du joueur depuis l'API OAuth
  const { getOAuthConfig } = await import('@/lib/auth')
  const playerResponse = await fetch(`${getOAuthConfig().issuer}/api/public/players/${data.joueur_oauth_id}`)
  const playerData = await playerResponse.json()
  
  // Récupérer les informations du club depuis l'API OAuth
  const clubResponse = await fetch(`${getOAuthConfig().issuer}/api/public/clubs/${user.sub}`)
  const clubData = await clubResponse.json()

  // Générer un numéro de licence unique
  const numero_licence = `LIC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  
  // Calculer la date d'expiration (par défaut 12 mois)
  const duree = data.duree_mois || 12
  const date_expiration = new Date()
  date_expiration.setMonth(date_expiration.getMonth() + duree)
  
  // Générer la saison actuelle
  const currentYear = new Date().getFullYear()
  const saison = `${currentYear}-${currentYear + 1}`

  const licence = await prisma.licence.create({
    data: {
      numero_licence,
      joueur_oauth_id: data.joueur_oauth_id,
      joueur_nom: playerData.lastName || 'Nom',
      joueur_prenom: playerData.firstName || 'Prénom',
      club_oauth_id: user.sub,
      club_nom: clubData.name || 'Club',
      pack_donation_id: data.pack_donation_id,
      date_expiration,
      montant_paye: data.montant_paye,
      statut: 'active',
      saison
    },
    include: {
      pack: {
        select: {
          nom: true,
          code: true,
          prix: true
        }
      }
    }
  })

  return {
    ...licence,
    montant_paye: Number(licence.montant_paye),
    pack: {
      ...licence.pack,
      prix: Number(licence.pack.prix)
    }
  }
}

export async function getClubLicences(club_oauth_id?: string): Promise<LicenceData[]> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Non authentifié')
  }

  const clubId = club_oauth_id || user.sub

  const licences = await prisma.licence.findMany({
    where: { club_oauth_id: clubId },
    include: {
      pack: {
        select: {
          nom: true,
          code: true,
          prix: true
        }
      }
    },
    orderBy: { created_at: 'desc' }
  })

  return licences.map(licence => ({
    ...licence,
    montant_paye: Number(licence.montant_paye),
    pack: {
      ...licence.pack,
      prix: Number(licence.pack.prix)
    }
  }))
}

export async function getPlayerLicences(joueur_oauth_id: string): Promise<LicenceData[]> {
  try {
    const licences = await prisma.licence.findMany({
      where: { joueur_oauth_id },
      include: {
        pack: {
          select: {
            nom: true,
            code: true,
            prix: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    return licences.map(licence => ({
      ...licence,
      montant_paye: Number(licence.montant_paye),
      pack: {
        ...licence.pack,
        prix: Number(licence.pack.prix)
      }
    }))
  } catch (error) {
    console.error('Erreur getPlayerLicences:', error)
    return []
  }
}

export async function updateLicenceStatus(licenceId: string, statut: string): Promise<LicenceData> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Non authentifié')
  }

  const licence = await prisma.licence.update({
    where: { id: licenceId },
    data: { statut },
    include: {
      pack: {
        select: {
          nom: true,
          code: true,
          prix: true
        }
      }
    }
  })

  return {
    ...licence,
    montant_paye: Number(licence.montant_paye),
    pack: {
      ...licence.pack,
      prix: Number(licence.pack.prix)
    }
  }
}