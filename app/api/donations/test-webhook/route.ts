import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Vérifier si la donation existe
    const donation = await prisma.donation.findUnique({
      where: { stripe_session_id: sessionId },
      include: {
        joueur: true,
        parrain: true
      }
    });

    if (!donation) {
      return NextResponse.json({ 
        success: false, 
        message: 'Donation not found',
        sessionId 
      });
    }

    // Vérifier la cohérence des données
    const joueurStats = await prisma.joueur.findUnique({
      where: { id: donation.joueur_id },
      select: {
        total_dons_recus: true,
        nombre_donateurs: true
      }
    });

    const parrainCount = await prisma.parrain.count({
      where: { joueur_id: donation.joueur_id }
    });

    const donationsCount = await prisma.donation.count({
      where: { joueur_id: donation.joueur_id }
    });

    return NextResponse.json({
      success: true,
      validation: {
        donation_exists: !!donation,
        parrain_exists: !!donation.parrain,
        joueur_stats_updated: Number(joueurStats?.total_dons_recus || 0) >= Number(donation.montant),
        parrain_count_matches: parrainCount === (joueurStats?.nombre_donateurs || 0)
      },
      data: {
        donation: {
          id: donation.id,
          montant: Number(donation.montant),
          statut: donation.statut,
          donateur_email: donation.donateur_email,
          donateur_nom: donation.donateur_nom,
          is_anonymous: donation.is_anonymous,
          parrain_id: donation.parrain_id
        },
        joueur: {
          id: donation.joueur.id,
          nom: `${donation.joueur.prenom} ${donation.joueur.nom}`,
          total_dons_recus: Number(joueurStats?.total_dons_recus || 0),
          nombre_donateurs_cache: joueurStats?.nombre_donateurs || 0
        },
        parrain: donation.parrain ? {
          id: donation.parrain.id,
          donateur_id: donation.parrain.donateur_id,
          total_donne: Number(donation.parrain.total_donne),
          nombre_dons: donation.parrain.nombre_dons,
          is_anonymous: donation.parrain.is_anonymous
        } : null,
        stats: {
          total_parrains: parrainCount,
          total_donations: donationsCount
        }
      }
    });

  } catch (error) {
    console.error('Error testing webhook data:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}