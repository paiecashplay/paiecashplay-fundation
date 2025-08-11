import { prisma } from '@/lib/prisma'
import { ensureSeedData } from '@/lib/ensureSeed'

export interface PackDonation {
  id: string
  nom: string
  code: string
  description: string | null
  prix: number
  devise: string
  type_recurrence: string
  icone_fa: string | null
  couleur_icone: string | null
  couleur_fond: string | null
  couleur_bouton: string | null
  avantages: any
  actif: boolean
  ordre_affichage: number
}

export async function getActiveDonationPacks(): Promise<PackDonation[]> {
  // S'assurer que les données de seed existent
  await ensureSeedData()
  
  const packs = await prisma.packDonation.findMany({
    where: { actif: true },
    orderBy: { ordre_affichage: 'asc' }
  })
  
  return packs.map(pack => ({
    ...pack,
    prix: Number(pack.prix)
  }))
}