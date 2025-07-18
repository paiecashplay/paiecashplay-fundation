# Base de données PaieCashPlay Fondation

Ce dossier contient les scripts SQL pour la création et l'initialisation de la base de données.

## Structure des fichiers

- `unified_schema.sql` : Schéma complet de la base de données avec intégration Keycloak
- `seed_data.sql` : Données de base pour le fonctionnement de l'application
- `cloud_sql_schema.sql` : Version optimisée pour Google Cloud SQL
- `cloud_sql_seed.sql` : Données de base pour Google Cloud SQL

## Installation sur MySQL local

1. Créer la base de données
```bash
mysql -u votre_utilisateur -p -e "CREATE DATABASE paiecashplay_fondation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

2. Exécuter le script de schéma
```bash
mysql -u votre_utilisateur -p paiecashplay_fondation < database/unified_schema.sql
```

3. Exécuter le script de données
```bash
mysql -u votre_utilisateur -p paiecashplay_fondation < database/seed_data.sql
```

## Installation sur Google Cloud SQL

1. Créer la base de données
```bash
gcloud sql databases create paiecashplay_fondation --instance=VOTRE_INSTANCE
```

2. Exécuter le script de schéma optimisé pour Cloud SQL
```bash
gcloud sql import sql VOTRE_INSTANCE gs://VOTRE_BUCKET/cloud_sql_schema.sql --database=paiecashplay_fondation
```

3. Exécuter le script de données
```bash
gcloud sql import sql VOTRE_INSTANCE gs://VOTRE_BUCKET/cloud_sql_seed.sql --database=paiecashplay_fondation
```

## Structure de la base de données

### Tables principales
- `user_profiles` : Profils utilisateurs liés à Keycloak
- `federation_profiles` : Profils des fédérations
- `club_profiles` : Profils des clubs
- `player_profiles` : Profils des joueurs
- `enfants` : Enfants bénéficiaires
- `licences` : Licences sportives
- `donations` : Dons effectués
- `parrainages` : Parrainages d'enfants

### Tables de référence
- `zones_caf` : Zones de la Confédération Africaine de Football
- `pays` : Pays africains
- `federations` : Fédérations de football
- `clubs` : Clubs de football
- `types_licences` : Types de licences disponibles
- `packs_donation` : Packs de donation

### Tables administratives
- `admins` : Administrateurs du système
- `contacts` : Messages de contact
- `newsletters` : Abonnements à la newsletter
- `statistiques_impact` : Statistiques d'impact

## Intégration avec Keycloak

Le schéma est conçu pour fonctionner avec Keycloak comme système d'authentification :
- Les utilisateurs sont créés dans Keycloak
- Les informations complémentaires sont stockées dans les tables `user_profiles` et les tables spécifiques
- Les tables `donations` et `parrainages` référencent les utilisateurs via leur ID Keycloak