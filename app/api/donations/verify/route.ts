import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    
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

    // Vérifier les statistiques du joueur
    const joueurStats = await prisma.joueur.findUnique({
      where: { id: donation.joueur_id },
      select: {
        total_dons_recus: true,
        nombre_donateurs: true
      }
    });

    // Compter les parrains réels
    const parrainCount = await prisma.parrain.count({
      where: { joueur_id: donation.joueur_id }
    });

    return NextResponse.json({
      success: true,
      donation: {
        id: donation.id,
        montant: Number(donation.montant),
        statut: donation.statut,
        donateur_email: donation.donateur_email,
        donateur_nom: donation.donateur_nom,
        joueur_nom: `${donation.joueur.prenom} ${donation.joueur.nom}`,
        pack_nom: donation.pack_nom,
        is_anonymous: donation.is_anonymous,
        date_paiement: donation.date_paiement,
        stripe_session_id: donation.stripe_session_id,
        stripe_payment_id: donation.stripe_payment_id
      },
      joueur_stats: {
        total_dons_recus: Number(joueurStats?.total_dons_recus || 0),
        nombre_donateurs_cache: joueurStats?.nombre_donateurs || 0,
        nombre_parrains_reel: parrainCount
      },
      parrain: donation.parrain ? {
        id: donation.parrain.id,
        total_donne: Number(donation.parrain.total_donne),
        nombre_dons: donation.parrain.nombre_dons,
        donateur_email: donation.parrain.donateur_email,
        donateur_nom: donation.parrain.donateur_nom
      } : null
    });

  } catch (error) {
    console.error('Error verifying donation:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}