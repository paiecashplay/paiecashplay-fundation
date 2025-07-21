# Configuration de Production pour PaieCashPlay Fondation

Ce guide détaille les étapes spécifiques pour déployer l'application PaieCashPlay Fondation en production.

## Variables d'environnement

Créez un fichier `.env.production` avec les variables suivantes :

```
# Stripe Configuration
STRIPE_WEBHOOK_SECRET=votre_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=votre_publishable_key
STRIPE_SECRET_KEY=votre_secret_key

# Base de données
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe
DB_NAME=votre_base_de_donnees

# Keycloak
KEYCLOAK_CLIENT_SECRET=votre_client_secret
KEYCLOAK_BASE_URL=https://auth.paiecashplay.com
KEYCLOAK_REALM=PaiecashPlay
KEYCLOAK_CLIENT_ID=paiecashplay-fundation
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=votre_mot_de_passe_admin

# NextAuth
NEXTAUTH_URL=https://fundation.paiecashplay.com
NEXTAUTH_SECRET=votre_nextauth_secret
URL_HOTE=https://fundation.paiecashplay.com

# Environment
NODE_ENV=production

# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

## Configuration de Keycloak pour la production

1. Assurez-vous que Keycloak est correctement configuré pour la production :
   - URL de base : `https://auth.paiecashplay.com`
   - Valid redirect URIs : `https://fundation.paiecashplay.com/*`
   - Web origins : `https://fundation.paiecashplay.com`

2. Vérifiez que le client secret est correctement configuré dans votre fichier `.env.production`.

## Build et déploiement

1. Construisez l'application pour la production :
```bash
npm run build
```

2. Démarrez l'application en mode production :
```bash
npm start
```

## Déploiement sur Google Cloud Run

1. Construisez l'image Docker :
```bash
docker build -t gcr.io/votre-projet/paiecashplay-fondation .
```

2. Poussez l'image vers Google Container Registry :
```bash
docker push gcr.io/votre-projet/paiecashplay-fondation
```

3. Déployez sur Cloud Run :
```bash
gcloud run deploy paiecashplay-fondation \
  --image gcr.io/votre-projet/paiecashplay-fondation \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated
```

## Vérification du déploiement

1. Accédez à votre application à l'URL `https://fundation.paiecashplay.com`
2. Vérifiez que l'authentification fonctionne correctement
3. Testez les fonctionnalités principales de l'application

## Résolution des problèmes courants en production

### Problèmes d'authentification

Si vous rencontrez des problèmes d'authentification en production :

1. Vérifiez les logs de l'application pour identifier les erreurs
2. Assurez-vous que les URLs de redirection sont correctement configurées dans Keycloak
3. Vérifiez que le client secret est correct
4. Assurez-vous que les cookies sont correctement configurés avec `secure: true`

### Problèmes de base de données

Si vous rencontrez des problèmes de connexion à la base de données :

1. Vérifiez que le proxy Cloud SQL est correctement configuré
2. Assurez-vous que les identifiants de connexion sont corrects
3. Vérifiez que la base de données est accessible depuis l'environnement de production