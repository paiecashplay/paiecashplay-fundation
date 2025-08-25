import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { getOAuthConfig } from '@/lib/auth';


const prisma = new PrismaClient();

export async function GET(request: NextRequest) {

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
  });

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID manquant' }, { status: 400 });
    }

    // Récupérer les détails de la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Paiement non confirmé' }, { status: 400 });
    }

    const metadata = session.metadata!;
    const amount = session.amount_total! / 100; // Convertir de centimes en euros

    // Enregistrer le don en base de données
    const donation = await prisma.donation.create({
      data: {
        montant: amount,
        type_recurrence: metadata.donationType.includes('mensuel') ? 'mensuel' : 
                        metadata.donationType.includes('annuel') ? 'annuel' : 'unique',
        statut: 'completed',
        stripe_session_id: sessionId,
        donateur_id: metadata.isAnonymous === 'true' ? null : metadata.donorId || null,
        joueur_id: parseInt(metadata.childId),
        pack_nom: metadata.packName,
        is_anonymous: metadata.isAnonymous === 'true',
        date_creation: new Date(),
      },
    });

    // Si l'utilisateur n'est pas anonyme et a un donorId, mettre à jour son statut de donateur
    if (metadata.isAnonymous === 'false' && metadata.donorId) {
      try {
        const response = await fetch(`${getOAuthConfig().issuer}/api/users/${metadata.donorId}/add-donor-role`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OAUTH_CLIENT_SECRET}`,
          },
          body: JSON.stringify({
            totalDonated: amount,
            preferredCauses: ['youth_development'],
          }),
        });

        if (!response.ok) {
          console.log('Utilisateur déjà donateur ou erreur mise à jour rôle');
        }
      } catch (error) {
        console.error('Erreur mise à jour rôle donateur:', error);
      }
    }

    // Mettre à jour les statistiques du joueur
    await prisma.joueur.update({
      where: { id: parseInt(metadata.childId) },
      data: {
        total_dons_recus: {
          increment: amount,
        },
        nombre_donateurs: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      amount,
      packName: metadata.packName,
      childName: metadata.childName,
      donationType: metadata.donationType,
      isAnonymous: metadata.isAnonymous === 'true',
    });

  } catch (error) {
    console.error('Erreur traitement succès paiement:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement du paiement' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}