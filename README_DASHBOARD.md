# Dashboard Club - Guide d'implémentation

## Vue d'ensemble

Le dashboard club permet aux clubs de gérer leurs membres (joueurs) et de visualiser les licences de donation associées. Les informations des membres sont stockées dans le système OAuth externe, tandis que les licences sont gérées localement.

## Architecture

### Système OAuth (Externe)
- **URL Local**: `http://localhost:3000`
- **URL Production**: `https://auth.paiecashplay.com`
- Stocke toutes les informations des utilisateurs (clubs, joueurs, etc.)
- Gère l'authentification et les permissions

### Base de données locale
- Stocke uniquement les **licences de donation**
- Référence les utilisateurs par leur **ID OAuth** (pas de duplication des données)
- Modèle `Licence` avec `joueur_oauth_id` et `club_oauth_id`

## Fonctionnalités implémentées

### 1. Dashboard Club (`/dashboard`)
- **Accès**: Réservé aux utilisateurs de type `club`
- **Statistiques**: Nombre de membres, répartition par poste, âge moyen
- **Liste des membres**: Affichage des joueurs du club
- **Ajout de membres**: Modal pour créer de nouveaux comptes joueurs

### 2. Gestion des membres
- **Service**: `lib/services/clubService.ts`
- **API Routes**: 
  - `GET /api/club/members` - Liste des membres
  - `POST /api/club/members/add` - Ajout d'un membre
  - `GET /api/club/stats` - Statistiques du club

### 3. Système de licences
- **Service**: `lib/services/licenceService.ts`
- **API Route**: `GET /api/club/licences` - Licences du club
- **Modèle**: Stockage des licences avec références OAuth

## Flux d'utilisation

### Ajout d'un nouveau joueur
1. Club se connecte au dashboard
2. Clic sur "Ajouter un membre"
3. Saisie des informations du joueur
4. Création du compte dans le système OAuth
5. Le joueur peut maintenant se connecter avec ses identifiants

### Attribution d'une licence
1. Lors d'une donation, une licence est créée
2. La licence référence le `joueur_oauth_id` et `club_oauth_id`
3. Aucune duplication des données utilisateur

## Configuration requise

### Variables d'environnement
```env
# OAuth Configuration
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_OAUTH_ISSUER=http://localhost:3000  # ou https://auth.paiecashplay.com
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://localhost:3001/api/auth/callback

# Scopes requis
# clubs:read clubs:write clubs:members users:write players:read
```

### Permissions OAuth
- `clubs:read` - Lire les informations des clubs
- `clubs:write` - Modifier les clubs
- `clubs:members` - Gérer les membres des clubs
- `users:write` - Créer de nouveaux utilisateurs
- `players:read` - Lire les informations des joueurs

## API OAuth utilisées

### Récupération des membres
```javascript
GET /api/oauth/clubs/{clubId}/members
Authorization: Bearer {access_token}
```

### Ajout d'un membre
```javascript
POST /api/oauth/clubs/{clubId}/members
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "email": "player@club.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "country": "FR",
  "metadata": {
    "position": "forward",
    "jerseyNumber": "10"
  }
}
```

### Statistiques du club
```javascript
GET /api/oauth/stats/clubs/{clubId}
Authorization: Bearer {access_token}
```

## Prochaines étapes

1. **Intégration complète des licences**
   - Affichage des licences dans le dashboard
   - Création automatique lors des donations

2. **Gestion avancée des membres**
   - Modification des informations
   - Gestion des statuts (actif, blessé, suspendu)
   - Suppression/transfert de membres

3. **Rapports et analytics**
   - Historique des donations par joueur
   - Statistiques de performance
   - Export des données

4. **Notifications**
   - Alertes pour les licences expirées
   - Notifications de nouvelles donations

## Structure des fichiers

```
app/
├── dashboard/
│   └── page.tsx                 # Page principale du dashboard
├── api/
│   └── club/
│       ├── members/
│       │   ├── route.ts         # GET membres
│       │   └── add/
│       │       └── route.ts     # POST nouveau membre
│       ├── stats/
│       │   └── route.ts         # GET statistiques
│       └── licences/
│           └── route.ts         # GET licences

components/
└── club/
    └── AddMemberModal.tsx       # Modal d'ajout de membre

lib/
└── services/
    ├── clubService.ts           # Service club avec OAuth
    └── licenceService.ts        # Service licences local

hooks/
└── useAuth.ts                   # Hook d'authentification
```

## Tests recommandés

1. **Test d'authentification**
   - Accès refusé pour les non-clubs
   - Redirection si non connecté

2. **Test d'ajout de membre**
   - Validation des champs obligatoires
   - Création réussie dans le système OAuth
   - Mise à jour de la liste des membres

3. **Test des statistiques**
   - Calcul correct des moyennes
   - Répartition par poste
   - Gestion des cas vides

4. **Test d'intégration OAuth**
   - Gestion des erreurs réseau
   - Refresh des tokens
   - Gestion des permissions insuffisantes