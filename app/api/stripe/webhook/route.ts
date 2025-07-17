import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, isStripeConfigured } from '@/lib/stripe-server';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  // Vérifier que Stripe est configuré
  if (!isStripeConfigured()) {
    console.error('Stripe n\'est pas configuré correctement');
    return NextResponse.json({ error: 'Stripe configuration missing' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handleSuccessfulPayment(session);
      break;

    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice;
      await handleRecurringPayment(invoice);
      break;

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice;
      await handleFailedPayment(failedInvoice);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  console.log('✅ Paiement réussi:', {
    sessionId: session.id,
    amount: session.amount_total,
    customerEmail: session.customer_details?.email,
    packName: session.metadata?.packName,
    childId: session.metadata?.childId,
    childName: session.metadata?.childName,
  });

  // Attribution automatique de la licence à l'enfant
  if (session.metadata?.childId) {
    await assignLicenseToChild({
      childId: parseInt(session.metadata.childId),
      packName: session.metadata.packName || '',
      sessionId: session.id,
      amount: session.amount_total || 0
    });
  }
}

async function assignLicenseToChild(data: {
  childId: number;
  packName: string;
  sessionId: string;
  amount: number;
}) {
  // Ici vous pourriez mettre à jour votre base de données
  // Pour l'instant, on simule l'attribution
  console.log('🎯 Attribution de licence:', {
    childId: data.childId,
    packName: data.packName,
    licenseNumber: `LIC${Date.now()}`,
    status: 'assigned'
  });
  
  // Simulation de mise à jour des données
  const { addLicense } = await import('@/lib/licenseData');
  
  // Ajouter la licence aux données (simulation)
  // En production, ceci serait une requête vers votre base de données
  try {
    addLicense(
      data.childId,
      'Enfant', // Nom récupéré depuis les métadonnées
      data.packName,
      'Club', // Club récupéré depuis les métadonnées
      'Pays' // Pays récupéré depuis les métadonnées
    );
    console.log('✅ Licence ajoutée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la licence:', error);
  }
}

async function handleRecurringPayment(invoice: Stripe.Invoice) {
  console.log('🔄 Paiement récurrent réussi:', {
    invoiceId: invoice.id,
    amount: invoice.amount_paid,
    customerEmail: invoice.customer_email,
  });
}

async function handleFailedPayment(invoice: Stripe.Invoice) {
  console.log('❌ Échec de paiement:', {
    invoiceId: invoice.id,
    customerEmail: invoice.customer_email,
  });
}