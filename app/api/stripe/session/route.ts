import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET(request: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
    });

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID manquant' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Générer un numéro de licence basé sur les métadonnées
    const licenseNumber = `PCP${Date.now().toString().slice(-6)}`;

    const responseData = {
      sessionId: session.id,
      amount: session.amount_total,
      currency: session.currency,
      status: session.payment_status,
      donorEmail: session.customer_details?.email,
      packName: session.metadata?.packName,
      childId: session.metadata?.childId,
      childName: session.metadata?.childName,
      licenseNumber,
      donationType: session.metadata?.donationType,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Erreur récupération session:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la session' },
      { status: 500 }
    );
  }
}