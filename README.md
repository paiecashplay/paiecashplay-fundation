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
mysql -u votre_utilisateur -p < database/cloud_sql_schema.sql
mysql -u votre_utilisateur -p < database/cloud_sql_seed.sql
```

5. Démarrer l'application en développement
```bash
npm run dev
```

## Configuration de Keycloak

1. Installer et démarrer Keycloak
```bash
# Avec Docker
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:latest start-dev
```

2. Accéder à la console d'administration: http://localhost:8080/admin

3. Créer un realm `PaiecashPlay`

4. Créer un client `paiecashplay-fundation` avec les paramètres suivants:
   - Client authentication: ON
   - Authorization: ON
   - Valid redirect URIs: `http://localhost:3000/*`
   - Web origins: `http://localhost:3000`

5. Générer un secret client et le copier dans votre fichier `.env.local`

6. Créer les rôles:
   - `admin`
   - `user`
   - `federation`
   - `club`
   - `player`

7. Configurer les mappers pour inclure les informations utilisateur dans le token:
   - Ajouter un mapper pour les rôles
   - Ajouter des mappers pour les informations utilisateur (email, nom, prénom)

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

### Processus d'authentification

1. L'utilisateur clique sur "Créer un compte" ou "Se connecter"
2. Il est redirigé vers Keycloak pour s'authentifier
3. Après authentification, il est redirigé vers `/api/auth/callback`
4. Le callback échange le code contre un token et stocke les tokens dans des cookies sécurisés
5. L'utilisateur est redirigé vers `/auth/setup` pour choisir son type de compte
6. Après avoir choisi son type de compte, l'utilisateur remplit les informations spécifiques
7. Les informations sont enregistrées dans la base de données et le rôle correspondant est attribué dans Keycloak

### Résolution des problèmes d'authentification

Si vous rencontrez des erreurs lors de l'authentification:

1. Vérifiez que Keycloak est correctement configuré avec les bons redirects URIs
2. Assurez-vous que le client secret est correctement configuré dans `.env.local`
3. Vérifiez les logs de Keycloak pour identifier les erreurs
4. Assurez-vous que les rôles sont correctement créés dans Keycloak

## Licence

Copyright © 2025 PaieCashPlay