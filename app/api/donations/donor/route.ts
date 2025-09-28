import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer les parrainages du donateur
    const parrainages = await prisma.parrain.findMany({
      where: { donateur_id: user.sub },
      include: {
        joueur: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            photo_emoji: true,
            club_nom: true,
            pays_nom: true
          }
        },
        donations: {
          select: {
            id: true,
            montant: true,
            pack_nom: true,
            type_recurrence: true,
            date_paiement: true
          },
          orderBy: { date_paiement: 'desc' }
        }
      },
      orderBy: { date_dernier_don: 'desc' }
    });

    // Calculer les statistiques
    const stats = {
      totalDonne: parrainages.reduce((sum, p) => sum + Number(p.total_donne), 0),
      nombreDons: parrainages.reduce((sum, p) => sum + p.nombre_dons, 0),
      nombreEnfants: parrainages.length,
      dernierDon: parrainages.length > 0 ? parrainages[0].date_dernier_don : null
    };

    return NextResponse.json({
      stats,
      parrainages
    });
  } catch (error) {
    console.error('Erreur récupération données donateur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}