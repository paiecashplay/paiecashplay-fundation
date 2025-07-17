import Stripe from 'stripe';

// Initialiser Stripe côté serveur
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia', // Utiliser la version requise de l'API
});

// Vérifier la configuration Stripe
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY && !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}