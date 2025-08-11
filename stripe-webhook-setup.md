# Configuration Webhook Stripe

## URL du Webhook
**URL de production** : `https://votre-domaine.com/api/stripe/webhook`
**URL de développement** : `http://localhost:3001/api/stripe/webhook`

## Événements à écouter
- `checkout.session.completed` - Session de paiement terminée
- `payment_intent.succeeded` - Paiement réussi
- `payment_intent.payment_failed` - Paiement échoué
- `invoice.payment_succeeded` - Paiement d'abonnement réussi

## Configuration dans Stripe Dashboard
1. Aller sur https://dashboard.stripe.com/webhooks
2. Cliquer sur "Add endpoint"
3. Entrer l'URL : `http://localhost:3001/api/stripe/webhook`
4. Sélectionner les événements listés ci-dessus
5. Copier le "Signing secret" dans le fichier .env

## Test en local avec Stripe CLI
```bash
# Installer Stripe CLI
# Puis écouter les webhooks
stripe listen --forward-to localhost:3001/api/stripe/webhook

# Le CLI affichera le webhook secret à utiliser
```

## Variables d'environnement requises
```
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook
```