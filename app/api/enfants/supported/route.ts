import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Utiliser l'API publique OAuth (sans authentification)
    const oauthResponse = await fetch(`${process.env.OAUTH_ISSUER}/api/public/players?limit=50`, {
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
    
    // Récupérer les données de donations depuis la BD locale
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      // Transformer les données avec les vraies données de donations
      const supportedChildren = await Promise.all(
        playersData.players?.slice(0, 3).map(async (player: any) => {
          // Récupérer les licences du joueur
          const licences = await prisma.licence.findMany({
            where: { joueur_oauth_id: player.id },
            include: { pack: true }
          })
          
          const totalDons = licences.reduce((sum, licence) => 
            sum + Number(licence.montant_paye), 0
          )
          
          return {
            id: player.id,
            nom: player.lastName || 'Nom',
            prenom: player.firstName || 'Prénom',
            age: player.metadata?.birthDate ? 
              new Date().getFullYear() - new Date(player.metadata.birthDate).getFullYear() : 
              18,
            pays_nom: player.country || 'France',
            photo_emoji: getRandomEmoji(),
            club_nom: player.club?.name || 'Club de Football',
            total_dons_recus: totalDons,
            nombre_parrains: licences.length
          }
        }) || []
      )
      
      await prisma.$disconnect()
      
      return NextResponse.json({ 
        success: true, 
        data: supportedChildren 
      })
    } catch (dbError) {
      console.error('Erreur BD:', dbError)
      await prisma.$disconnect()
      
      // Fallback avec données de base si erreur BD
      const fallbackData = playersData.players?.slice(0, 3).map((player: any) => ({
        id: player.id,
        nom: player.lastName || 'Nom',
        prenom: player.firstName || 'Prénom',
        age: 18,
        pays_nom: player.country || 'France',
        photo_emoji: getRandomEmoji(),
        club_nom: player.club?.name || 'Club de Football',
        total_dons_recus: 0,
        nombre_parrains: 0
      })) || []
      
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