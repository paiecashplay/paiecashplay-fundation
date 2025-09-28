import { NextResponse } from 'next/server'
import { getOAuthConfig } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const limit = searchParams.get('limit') || '50';

    // Construire l'URL de l'API OAuth
    let oauthUrl = `${getOAuthConfig().issuer}/api/public/players?limit=${limit}`;
    if (country) {
      oauthUrl += `&country=${country}`;
    }

    // Utiliser l'API publique OAuth (sans authentification)
    const oauthResponse = await fetch(oauthUrl, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!oauthResponse.ok) {
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la récupération des joueurs' 
      }, { status: 500 });
    }

    const playersData = await oauthResponse.json();
    
    // Récupérer les données de donations depuis la BD locale
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      // Récupérer tous les joueurs avec leurs données de donations
      const allPlayersWithDonations = await Promise.all(
        playersData.players?.map(async (player: any) => {
          // Calculer l'âge correctement
          let calculatedAge = 18; // fallback
          if (player.age) {
            calculatedAge = player.age;
          } else if (player.dateOfBirth) {
            const birthDate = new Date(player.dateOfBirth);
            const today = new Date();
            calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              calculatedAge--;
            }
          }
          
          // Trouver le joueur local par oauth_id
          const localJoueur = await prisma.joueur.findUnique({
            where: { oauth_id: player.id }
          });
          
          let donations: any[] = [];
          let parrains: any[] = [];
          
          if (localJoueur) {
            // Récupérer les donations du joueur
            donations = await prisma.donation.findMany({
              where: { 
                joueur_id: localJoueur.id,
                statut: 'completed'
              }
            });
            
            // Récupérer le nombre de parrains uniques
            parrains = await prisma.parrain.findMany({
              where: {
                joueur_id: localJoueur.id
              }
            });
          }
          
          const totalDons = donations.reduce((sum, donation) => 
            sum + Number(donation.montant), 0
          );
          
          return {
            id: player.id,
            nom: player.lastName || 'Nom',
            prenom: player.firstName || 'Prénom',
            age: calculatedAge,
            position: player.position || 'midfielder',
            has_license: !!(player.club && player.club.name && player.club.name !== 'PaiecashPlay Club'),
            photo_emoji: getRandomEmoji(),
            club_nom: player.club?.name || 'Club non renseigné',
            pays_nom: player.country || 'France',
            federation_nom: player.club?.federation || 'Fédération',
            flag_emoji: getCountryFlag(player.country || 'FR'),
            email: player.email,
            phone: player.phone,
            createdAt: player.createdAt,
            isVerified: player.isVerified || false,
            jerseyNumber: Math.floor(Math.random() * 99) + 1,
            height: player.height ? `${player.height}cm` : null,
            weight: player.weight ? `${player.weight}kg` : null,
            status: player.status || 'active',
            total_dons_recus: totalDons,
            nombre_parrains: parrains.length
          };
        }) || []
      );
      
      // Trier par total des dons reçus (du plus petit au plus grand) pour la sélection d'enfant
      const sortedChildren = allPlayersWithDonations
        .sort((a, b) => a.total_dons_recus - b.total_dons_recus);
      
      await prisma.$disconnect();
      
      return NextResponse.json({ 
        success: true, 
        players: sortedChildren 
      });
    } catch (dbError) {
      console.error('Erreur BD:', dbError);
      await prisma.$disconnect();
      
      // Fallback avec données de base si erreur BD
      const fallbackData = playersData.players?.map((player: any) => {
        let calculatedAge = 18;
        if (player.age) {
          calculatedAge = player.age;
        } else if (player.dateOfBirth) {
          const birthDate = new Date(player.dateOfBirth);
          const today = new Date();
          calculatedAge = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
          }
        }
        
        return {
          id: player.id,
          nom: player.lastName || 'Nom',
          prenom: player.firstName || 'Prénom',
          age: calculatedAge,
          position: player.position || 'midfielder',
          has_license: !!(player.club && player.club.name && player.club.name !== 'PaiecashPlay Club'),
          photo_emoji: getRandomEmoji(),
          club_nom: player.club?.name || 'Club non renseigné',
          pays_nom: player.country || 'France',
          federation_nom: player.club?.federation || 'Fédération',
          flag_emoji: getCountryFlag(player.country || 'FR'),
          email: player.email,
          phone: player.phone,
          createdAt: player.createdAt,
          isVerified: player.isVerified || false,
          jerseyNumber: Math.floor(Math.random() * 99) + 1,
          height: player.height ? `${player.height}cm` : null,
          weight: player.weight ? `${player.weight}kg` : null,
          status: player.status || 'active',
          total_dons_recus: 0,
          nombre_parrains: 0
        };
      }) || [];
      
      return NextResponse.json({ 
        success: true, 
        players: fallbackData 
      });
    }
  } catch (error) {
    console.error('Erreur récupération joueurs pour sélection:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur serveur' 
    }, { status: 500 });
  }
}

function getRandomEmoji(): string {
  const emojis = ['⚽', '🏃♂️', '🏆', '🥅', '👟', '🎯', '⭐', '🔥', '💪', '🏅'];
  return emojis[Math.floor(Math.random() * emojis.length)];
}

function getCountryFlag(countryCode: string): string {
  const flags: { [key: string]: string } = {
    'FR': '🇫🇷', 'CM': '🇨🇲', 'SN': '🇸🇳', 'CI': '🇨🇮', 'MA': '🇲🇦',
    'DZ': '🇩🇿', 'TN': '🇹🇳', 'NG': '🇳🇬', 'GH': '🇬🇭', 'KE': '🇰🇪',
    'BF': '🇧🇫', 'ML': '🇲🇱', 'NE': '🇳🇪', 'TD': '🇹🇩', 'CF': '🇨🇫',
    'GA': '🇬🇦', 'CG': '🇨🇬', 'CD': '🇨🇩', 'AO': '🇦🇴', 'ZM': '🇿🇲'
  };
  return flags[countryCode] || '🌍';
}