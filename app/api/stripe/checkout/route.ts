import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-server'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    const { amount, donationType, packName, isRecurring, enfantId } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: isRecurring ? 'subscription' : 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: packName || 'Don PaieCashPlay',
              description: `Don ${donationType} - PaieCashPlay Fondation`,
            },
            unit_amount: Math.round(amount * 100),
            ...(isRecurring && {
              recurring: {
                interval: donationType.includes('mensuel') ? 'month' : 'year',
              },
            }),
          },
          quantity: 1,
        },
      ],
      success_url: `${request.nextUrl.origin}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}`,
      metadata: {
        donationType,
        packName: packName || 'Don personnalisé',
        userId: user?.sub || 'anonymous',
        enfantId: enfantId || '',
      },
      customer_email: user?.email,
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Erreur création session Stripe:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}