import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID manquant' }, { status: 400 });
  }

  try {
    const donation = await prisma.donation.findUnique({
      where: { stripe_session_id: sessionId },
      include: {
        joueur: {
          select: {
            prenom: true,
            nom: true,
            photo_emoji: true,
            club_nom: true,
            pays_nom: true
          }
        }
      }
    });

    if (!donation) {
      return NextResponse.json({ error: 'Donation non trouvée' }, { status: 404 });
    }

    return NextResponse.json(donation);
  } catch (error) {
    console.error('Erreur récupération donation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}