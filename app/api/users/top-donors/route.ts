import { NextResponse } from 'next/server'
import { getOAuthConfig } from '@/lib/auth';

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      // Récupérer les top donateurs depuis la BD locale
      const topDonors = await prisma.licence.groupBy({
        by: ['joueur_oauth_id'],
        _sum: {
          montant_paye: true
        },
        _count: {
          id: true
        },
        orderBy: {
          _sum: {
            montant_paye: 'desc'
          }
        },
        take: 10
      })

      // Récupérer les infos enrichies des donateurs
      const donorsWithInfo = await Promise.all(
        topDonors.map(async (donor) => {
          try {
            const oauthResponse = await fetch(`${getOAuthConfig().issuer}/api/public/players`)
            const playersData = await oauthResponse.json()
            const player = playersData.players?.find((p: any) => p.id === donor.joueur_oauth_id)
            
            // Récupérer les détails des donations
            const donations = await prisma.licence.findMany({
              where: { joueur_oauth_id: donor.joueur_oauth_id },
              include: { pack: true },
              orderBy: { created_at: 'desc' }
            })
            
            // Calculer les statistiques
            const totalDons = Number(donor._sum.montant_paye || 0)
            const moyenneDon = totalDons / donor._count.id
            const packPreference = getPreferredPack(donations)
            const anciennete = getAnciennete(donations[donations.length - 1]?.created_at)
            const dernierDon = donations[0]?.created_at
            const isRecent = dernierDon ? isRecentDonation(dernierDon) : false
            const badges = getBadges(donations, totalDons, moyenneDon, isRecent)
            
            return {
              id: donor.joueur_oauth_id,
              nom: player?.lastName || 'Nom',
              prenom: player?.firstName || 'Prénom',
              pays: player?.country || 'FR',
              total_dons: totalDons,
              nombre_donations: donor._count.id,
              moyenne_don: moyenneDon,
              pack_prefere: packPreference,
              anciennete_jours: anciennete,
              dernier_don: dernierDon,
              is_recent: isRecent,
              badges,
              photo_emoji: getRandomEmoji()
            }
          } catch {
            return {
              id: donor.joueur_oauth_id,
              nom: 'Joueur',
              prenom: 'Inconnu',
              pays: 'FR',
              total_dons: Number(donor._sum.montant_paye || 0),
              nombre_donations: donor._count.id,
              moyenne_don: 0,
              pack_prefere: null,
              anciennete_jours: 0,
              dernier_don: null,
              is_recent: false,
              badges: [],
              photo_emoji: '⚽'
            }
          }
        })
      )

      await prisma.$disconnect()
      
      return NextResponse.json({
        success: true,
        data: donorsWithInfo
      })
    } catch (dbError) {
      console.error('Erreur BD top donors:', dbError)
      await prisma.$disconnect()
      
      return NextResponse.json({
        success: true,
        data: []
      })
    }
  } catch (error) {
    console.error('Erreur top donors:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 })
  }
}

function getRandomEmoji(): string {
  const emojis = ['⚽', '🏃♂️', '🏆', '🥅', '👟', '🎯', '⭐', '🔥', '💪', '🏅']
  return emojis[Math.floor(Math.random() * emojis.length)]
}

function getPreferredPack(donations: any[]) {
  const packCounts = donations.reduce((acc, donation) => {
    const packName = donation.pack.nom
    acc[packName] = (acc[packName] || 0) + 1
    return acc
  }, {})
  
  return Object.keys(packCounts).reduce((a, b) => 
    packCounts[a] > packCounts[b] ? a : b
  ) || null
}

function getAnciennete(firstDonationDate: Date | null): number {
  if (!firstDonationDate) return 0
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - firstDonationDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function isRecentDonation(lastDonationDate: Date): boolean {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - lastDonationDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 7
}

function getBadges(donations: any[], totalDons: number, moyenneDon: number, isRecent: boolean): string[] {
  const badges = []
  
  if (donations.length >= 5) badges.push('Fidélité')
  if (moyenneDon >= 100) badges.push('Généreux')
  if (isRecent) badges.push('Récent')
  if (donations.length >= 3) badges.push('Régulier')
  if (totalDons >= 1000) badges.push('Mécène')
  
  return badges
}