import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';



export async function POST(request: NextRequest) {
  try {
console.warn("process.env.STRIPE_SECRET_KEY!", process.env.STRIPE_SECRET_KEY!);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const { amount, donationType, packName, isRecurring, childId, childName } = await request.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: isRecurring ? 'subscription' : 'payment',
      line_items: [
        {
          price_data: isRecurring ? {
            currency: 'eur',
            product_data: {
              name: packName || 'Don personnalisé',
              description: `Don ${donationType.toLowerCase()} pour soutenir les enfants africains`,
            },
            unit_amount: amount * 100,
            recurring: {
              interval: donationType === 'Don mensuel' ? 'month' : 'year',
            },
          } : {
            currency: 'eur',
            product_data: {
              name: packName || 'Don personnalisé',
              description: 'Don unique pour soutenir les enfants africains',
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${request.headers.get('origin')}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/`,
      metadata: {
        donationType,
        packName: packName || 'Don personnalisé',
        amount: amount.toString(),
        childId: childId?.toString() || '',
        childName: childName || '',
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Erreur création session Stripe:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}