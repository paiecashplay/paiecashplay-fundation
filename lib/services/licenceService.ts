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

  // Générer un numéro de licence unique
  const numero_licence = `LIC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  
  // Calculer la date d'expiration (par défaut 12 mois)
  const duree = data.duree_mois || 12
  const date_expiration = new Date()
  date_expiration.setMonth(date_expiration.getMonth() + duree)

  const licence = await prisma.licence.create({
    data: {
      numero_licence,
      joueur_oauth_id: data.joueur_oauth_id,
      club_oauth_id: user.sub, // ID du club connecté
      pack_donation_id: data.pack_donation_id,
      date_expiration,
      montant_paye: data.montant_paye,
      statut: 'active'
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