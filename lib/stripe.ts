import { loadStripe } from '@stripe/stripe-js';

// Initialiser Stripe côté client
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
};