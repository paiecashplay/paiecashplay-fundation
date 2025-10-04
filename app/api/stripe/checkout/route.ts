import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';



export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
  });

  try {
    const {
      amount,
      donationType,
      packName,
      isRecurring,
      childId,
      childName,
      isAnonymous,
      donorId
    } = await request.json();

    const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

    console.log('Creating checkout session with:', {
      amount,
      donationType,
      packName,
      childId,
      childName,
      isAnonymous,
      donorId
    });

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${packName} - ${childName}`,
              description: donationType,
            },
            unit_amount: amount * 100,
            ...(isRecurring && {
              recurring: {
                interval: 'month',
              },
            }),
          },
          quantity: 1,
        },
      ],
      mode: isRecurring ? 'subscription' : 'payment',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?cancelled=true`,
      customer_creation: 'always',
      billing_address_collection: 'auto',
      metadata: {
        donationType: donationType || '',
        packName: packName || '',
        childId: childId?.toString() || '',
        childName: childName || '',
        isAnonymous: (isAnonymous ?? true).toString(),
        donorId: donorId || '',
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Erreur création session Stripe:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}