import { NextResponse } from 'next/server'
import { getOAuthConfig } from '@/lib/auth';

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      // Récupérer les 3 dernières donations
      const recentDonations = await prisma.donation.findMany({
        take: 3,
        orderBy: {
          date_creation: 'desc'
        }
      })

      // Récupérer les infos des joueurs depuis l'API OAuth publique
      const donationsWithPlayerInfo = await Promise.all(
        recentDonations.map(async (donation) => {
          try {
            const oauthResponse = await fetch(`${getOAuthConfig().issuer}/api/public/players`)
            const playersData = await oauthResponse.json()
            const player = playersData.players?.find((p: any) => p.id === donation.joueur_id)
            
            // Calculer le temps écoulé
            const timeAgo = getTimeAgo(donation.date_creation)
            
            return {
              id: donation.id,
              title: `${donation.pack_nom} pour ${player?.firstName || 'Joueur'} ${player?.lastName || 'Inconnu'}`,
              description: `Montant: €${donation.montant} - Don généreux`,
              thanks: `Merci ${player?.firstName || 'Donateur'} !`,
              timeAgo,
              pack_code: getPackCode(donation.pack_nom),
              amount: Number(donation.montant),
              player_name: `${player?.firstName || 'Joueur'} ${player?.lastName || 'Inconnu'}`,
              player_country: player?.country || 'FR'
            }
          } catch {
            const timeAgo = getTimeAgo(donation.date_creation)
            return {
              id: donation.id,
              title: `${donation.pack_nom} pour un joueur`,
              description: `Montant: €${donation.montant} - Don généreux`,
              thanks: 'Merci Donateur !',
              timeAgo,
              pack_code: getPackCode(donation.pack_nom),
              amount: Number(donation.montant),
              player_name: 'Joueur Inconnu',
              player_country: 'FR'
            }
          }
        })
      )

      await prisma.$disconnect()

      return NextResponse.json({
        success: true,
        data: donationsWithPlayerInfo
      })

    } catch (dbError) {
      console.error('Erreur BD recent donations:', dbError)
      await prisma.$disconnect()
      
      return NextResponse.json({
        success: true,
        data: []
      })
    }
  } catch (error) {
    console.error('Erreur recent donations:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 })
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) {
    return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
  } else if (diffHours > 0) {
    return `il y a ${diffHours}h`
  } else {
    return 'il y a quelques minutes'
  }
}

function getPackCode(packName: string): string {
  const codeMap: { [key: string]: string } = {
    'License Solidaire': 'licenseSolidaire',
    'Champion Equipment': 'championEquipment',
    'Daily Energy': 'dailyEnergy',
    'Talent Journey': 'talentJourney',
    'Tomorrow\'s Training': 'tomorrowTraining'
  }
  return codeMap[packName] || 'licenseSolidaire'
}