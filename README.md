# PaieCashPlay Fondation

Application de gestion des packs de donation pour les jeunes footballeurs africains avec authentification OAuth 2.0.

## Prérequis

- Node.js 18+
- MySQL 5.7+ ou 8.0+

## Installation

1. Cloner le dépôt et installer les dépendances
```bash
npm install
```

2. Configurer les variables d'environnement
```bash
cp .env.example .env
# Modifier les variables dans .env :
# - DATABASE_URL pour la base de données
# - OAUTH_CLIENT_ID et OAUTH_CLIENT_SECRET pour l'authentification
# - JWT_SECRET pour les sessions locales
```

3. Configurer la base de données avec Prisma
```bash
npm run db:push
npm run db:seed
```

4. Démarrer l'application
```bash
npm run dev
```

## Scripts disponibles

- `npm run dev` - Démarrer en mode développement
- `npm run build` - Construire pour la production
- `npm run db:generate` - Générer le client Prisma
- `npm run db:push` - Pousser le schéma vers la base de données
- `npm run db:seed` - Insérer les données initiales
- `npm run db:studio` - Ouvrir Prisma Studio

## Authentification

Le projet utilise un système OAuth 2.0 personnalisé :

### URLs d'authentification
- **Connexion** : `/api/auth/login`
- **Callback** : `/api/auth/callback`
- **Déconnexion** : `/api/auth/logout`
- **Utilisateur actuel** : `/api/auth/me`

### Types d'utilisateurs supportés
- `player` - Joueur
- `club` - Club
- `federation` - Fédération
- `donor` - Donateur
- `company` - Entreprise
- `affiliate` - Affilié

## Structure du projet

- `/app` - Pages et API routes Next.js
- `/components` - Composants React réutilisables
- `/lib` - Services et utilitaires
- `/hooks` - Hooks React personnalisés
- `/prisma` - Schéma et migrations Prisma
- `/types` - Définitions TypeScript

## Base de données

Le projet utilise Prisma ORM avec MySQL. Seuls les packs de donation sont gérés dans cette version simplifiée.