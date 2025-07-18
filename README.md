# PaieCashPlay Fondation

Application de gestion des licences et donations pour les jeunes footballeurs africains.

## Prérequis

- Node.js 18+
- MySQL 5.7+ ou 8.0+
- Keycloak (pour l'authentification)

## Installation

1. Cloner le dépôt
```bash
git clone https://github.com/votre-utilisateur/paiecashplay-fondation.git
cd paiecashplay-fondation
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.local.example .env.local
# Modifier les valeurs dans .env.local
```

4. Créer la base de données
```bash
# Exécuter le script SQL
mysql -u votre_utilisateur -p < database/keycloak_schema.sql
```

5. Démarrer l'application en développement
```bash
npm run dev
```

## Configuration de Keycloak

1. Créer un realm `PaiecashPlay`
2. Créer un client `paiecashplay-fundation`
3. Configurer les redirections:
   - Valid redirect URIs: `http://localhost:3000/*`
   - Web origins: `http://localhost:3000`
4. Créer les rôles:
   - `admin`
   - `user`
   - `federation`
   - `club`
   - `player`

## Pour démarrer en local avec Cloud SQL

- Télécharger le proxy SQL sur https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.0.0/cloud-sql-proxy.x64.exe 

- Le lancer en précisant les paramètres et le fichier service-account-key.json:

```bash
cloud-sql-proxy.x64.exe YOUR_PROJECT_ID:YOUR_REGION:YOUR_INSTANCE_NAME -c key-v2.json
```


## Déploiement

### Sur Heroku

```bash
heroku create
git push heroku main
```

### Sur Google Cloud Run

```bash
gcloud run deploy
```

## Structure du projet

- `/app` - Pages et composants Next.js
- `/components` - Composants réutilisables
- `/lib` - Utilitaires et services
- `/database` - Scripts SQL
- `/public` - Fichiers statiques

## Authentification

L'authentification est gérée par Keycloak. Les utilisateurs peuvent avoir différents rôles:

- `admin` - Administrateurs du système
- `user` - Donateurs
- `federation` - Fédérations de football
- `club` - Clubs de football
- `player` - Joueurs

## Licence

Copyright © 2025 PaieCashPlay