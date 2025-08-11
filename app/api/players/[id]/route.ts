import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

const getOAuthBaseUrl = () => {
  return process.env.OAUTH_ISSUER || 'http://localhost:3000'
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const playerId = params.id

    // Récupérer les infos du joueur depuis l'API OAuth publique
    const oauthResponse = await fetch(`${getOAuthBaseUrl()}/api/public/players`)
    
    if (!oauthResponse.ok) {
      throw new Error('Erreur lors de la récupération des joueurs')
    }

    const playersData = await oauthResponse.json()
    const player = playersData.players?.find((p: any) => p.id === playerId)

    if (!player) {
      return NextResponse.json(
        { error: 'Joueur non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer les donations depuis la BD locale
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      const donations = await prisma.donation.findMany({
        where: { 
          joueur: {
            oauth_id: playerId
          }
        },
        include: { joueur: true },
        orderBy: { date_creation: 'desc' }
      })

      // Calculer les statistiques de donations
      const totalDonations = donations.reduce((sum, donation) => sum + Number(donation.montant), 0)
      const donationCount = donations.length

      // Récupérer les donations récentes avec infos des donateurs
      const recentDonations = await Promise.all(
        donations.slice(0, 5).map(async (donation) => {
          // Essayer de récupérer les infos du donateur si ce n'est pas anonyme
          let donorName = 'Donateur anonyme'
          if (donation.donateur_id && !donation.is_anonymous) {
            try {
              const donorResponse = await fetch(`${getOAuthBaseUrl()}/api/public/players`)
              const donorsData = await donorResponse.json()
              const donor = donorsData.players?.find((p: any) => p.id === donation.donateur_id)
              if (donor) {
                donorName = `${donor.firstName || ''} ${donor.lastName || ''}`.trim() || 'Donateur'
              }
            } catch {
              // Garder le nom par défaut
            }
          }

          return {
            id: donation.id,
            amount: Number(donation.montant),
            date: donation.date_creation.toISOString(),
            donor: donorName,
            packName: donation.pack_nom
          }
        })
      )

      // Licence active (la plus récente donation)
      const activeLicense = donations.length > 0 ? {
        id: donations[0].id,
        packName: donations[0].pack_nom,
        issuedAt: donations[0].date_creation.toISOString(),
        expiresAt: new Date(donations[0].date_creation.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 an
        downloadUrl: `/api/licenses/${donations[0].id}/download`
      } : null

      await prisma.$disconnect()

      // Formater les données du joueur
      const playerData = {
        id: player.id,
        email: player.email,
        firstName: player.firstName || player.given_name,
        lastName: player.lastName || player.family_name,
        country: player.country,
        phone: player.phone_number,
        isVerified: player.email_verified || false,
        createdAt: player.created_at ? new Date(player.created_at * 1000).toISOString() : new Date().toISOString(),
        metadata: {
          position: player.metadata?.position,
          licenseNumber: player.metadata?.licenseNumber,
          jerseyNumber: player.metadata?.jerseyNumber,
          birthDate: player.metadata?.birthDate,
          height: player.metadata?.height,
          weight: player.metadata?.weight,
          status: player.metadata?.status || 'active'
        },
        license: activeLicense,
        donations: {
          total: totalDonations,
          count: donationCount,
          recent: recentDonations
        }
      }

      return NextResponse.json({
        success: true,
        data: playerData
      })

    } catch (dbError) {
      console.error('Erreur BD player details:', dbError)
      await prisma.$disconnect()
      
      // Retourner les données de base sans les donations
      const playerData = {
        id: player.id,
        email: player.email,
        firstName: player.firstName || player.given_name,
        lastName: player.lastName || player.family_name,
        country: player.country,
        phone: player.phone_number,
        isVerified: player.email_verified || false,
        createdAt: player.created_at ? new Date(player.created_at * 1000).toISOString() : new Date().toISOString(),
        metadata: {
          position: player.metadata?.position,
          licenseNumber: player.metadata?.licenseNumber,
          jerseyNumber: player.metadata?.jerseyNumber,
          birthDate: player.metadata?.birthDate,
          height: player.metadata?.height,
          weight: player.metadata?.weight,
          status: player.metadata?.status || 'active'
        },
        license: null,
        donations: {
          total: 0,
          count: 0,
          recent: []
        }
      }

      return NextResponse.json({
        success: true,
        data: playerData
      })
    }

  } catch (error) {
    console.error('Erreur récupération player details:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Erreur serveur'
      },
      { status: 500 }
    )
  }
}