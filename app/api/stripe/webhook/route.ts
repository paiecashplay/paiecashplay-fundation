import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { getOAuthConfig } from '@/lib/auth';


const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
  });

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object.id);
        break;
      
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object.id);
        break;
      
      case 'invoice.payment_succeeded':
        await handleSubscriptionPayment(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata!;
  const amount = session.amount_total! / 100;

  // Vérifier si le don existe déjà
  const existingDonation = await prisma.donation.findUnique({
    where: { stripe_session_id: session.id }
  });

  if (existingDonation) {
    console.log('Donation already exists:', session.id);
    return;
  }

  // Créer le don
  await prisma.donation.create({
    data: {
      montant: amount,
      type_recurrence: metadata.donationType.includes('mensuel') ? 'mensuel' : 
                      metadata.donationType.includes('annuel') ? 'annuel' : 'unique',
      statut: 'completed',
      stripe_session_id: session.id,
      donateur_id: metadata.isAnonymous === 'true' ? null : metadata.donorId || null,
      joueur_id: parseInt(metadata.childId),
      pack_nom: metadata.packName,
      is_anonymous: metadata.isAnonymous === 'true',
      date_creation: new Date(),
    },
  });

  // Mettre à jour les statistiques du joueur
  await prisma.joueur.update({
    where: { id: parseInt(metadata.childId) },
    data: {
      total_dons_recus: { increment: amount },
      nombre_donateurs: { increment: 1 },
    },
  });

  // Mettre à jour le rôle donateur si nécessaire
  if (metadata.isAnonymous === 'false' && metadata.donorId) {
    try {
      await fetch(`${getOAuthConfig().issuer}/api/users/${metadata.donorId}/add-donor-role`, {
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
    } catch (error) {
      console.error('Erreur mise à jour rôle donateur:', error);
    }
  }

  console.log('Donation processed successfully:', session.id);
}

async function handleSubscriptionPayment(invoice: Stripe.Invoice) {
  if (invoice.subscription && invoice.paid) {
    console.log('Subscription payment succeeded:', invoice.id);
    // Gérer les paiements récurrents ici si nécessaire
  }
}