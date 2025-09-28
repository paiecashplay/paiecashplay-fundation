import { NextResponse } from 'next/server'
import { getOAuthConfig } from '@/lib/auth';

export async function GET() {
  try {
    // Utiliser l'API publique OAuth (sans authentification)
    const oauthResponse = await fetch(`${getOAuthConfig().issuer}/api/public/players?limit=50`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!oauthResponse.ok) {
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la récupération des joueurs' 
      }, { status: 500 })
    }

    const playersData = await oauthResponse.json()
    console.log('Données joueurs OAuth:', playersData)
    
    // Récupérer les données de donations depuis la BD locale
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      // Récupérer tous les joueurs avec leurs données de donations
      const allPlayersWithDonations = await Promise.all(
        playersData.players?.map(async (player: any) => {
          console.log('Player data:', {
            id: player.id,
            age: player.age,
            dateOfBirth: player.dateOfBirth,
            club: player.club
          })
          
          // Calculer l'âge correctement
          let calculatedAge = 18 // fallback
          if (player.age) {
            calculatedAge = player.age
          } else if (player.dateOfBirth) {
            const birthDate = new Date(player.dateOfBirth)
            const today = new Date()
            calculatedAge = today.getFullYear() - birthDate.getFullYear()
            const monthDiff = today.getMonth() - birthDate.getMonth()
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              calculatedAge--
            }
          }
          
          console.log('Calculated age:', calculatedAge)
          
          // Trouver le joueur local par oauth_id
          const localJoueur = await prisma.joueur.findUnique({
            where: { oauth_id: player.id }
          })
          
          let donations: any[] = []
          let parrains: any[] = []
          
          if (localJoueur) {
            // Récupérer les donations du joueur
            donations = await prisma.donation.findMany({
              where: { 
                joueur_id: localJoueur.id,
                statut: 'completed'
              }
            })
            
            // Récupérer le nombre de parrains uniques
            parrains = await prisma.parrain.findMany({
              where: {
                joueur_id: localJoueur.id
              }
            })
          }
          
          const totalDons = donations.reduce((sum, donation) => 
            sum + Number(donation.montant), 0
          )
          
          return {
            id: player.id,
            nom: player.lastName || 'Nom',
            prenom: player.firstName || 'Prénom',
            age: calculatedAge,
            pays_nom: player.country || 'France',
            photo_emoji: getRandomEmoji(),
            club_nom: player.club?.name || 'Club non renseigné',
            has_license: !!(player.club && player.club.name && player.club.name !== 'PaiecashPlay Club'),
            total_dons_recus: totalDons,
            nombre_parrains: parrains.length
          }
        }) || []
      )
      
      // Trier par total des dons reçus (du plus grand au plus petit) pour "Visages de l'Avenir"
      const sortedChildren = allPlayersWithDonations
        .sort((a, b) => b.total_dons_recus - a.total_dons_recus)
        .slice(0, 3)
      
      await prisma.$disconnect()
      
      return NextResponse.json({ 
        success: true, 
        data: sortedChildren 
      })
    } catch (dbError) {
      console.error('Erreur BD:', dbError)
      await prisma.$disconnect()
      
      // Fallback avec données de base si erreur BD
      const fallbackData = playersData.players?.slice(0, 3).map((player: any) => {
        // Calculer l'âge correctement pour le fallback aussi
        let calculatedAge = 18
        if (player.age) {
          calculatedAge = player.age
        } else if (player.dateOfBirth) {
          const birthDate = new Date(player.dateOfBirth)
          const today = new Date()
          calculatedAge = today.getFullYear() - birthDate.getFullYear()
          const monthDiff = today.getMonth() - birthDate.getMonth()
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--
          }
        }
        
        return {
          id: player.id,
          nom: player.lastName || 'Nom',
          prenom: player.firstName || 'Prénom',
          age: calculatedAge,
          pays_nom: player.country || 'France',
          photo_emoji: getRandomEmoji(),
          club_nom: player.club?.name || 'Club non renseigné',
          has_license: !!(player.club && player.club.name && player.club.name !== 'PaiecashPlay Club'),
          total_dons_recus: 0,
          nombre_parrains: 0
        }
      }) || []
      
      return NextResponse.json({ 
        success: true, 
        data: fallbackData 
      })
    }
  } catch (error) {
    console.error('Erreur récupération joueurs soutenus:', error)
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