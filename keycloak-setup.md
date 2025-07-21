# Configuration de Keycloak pour PaieCashPlay

Ce guide détaille les étapes précises pour configurer Keycloak correctement pour l'application PaieCashPlay.

## 1. Installation de Keycloak

### Avec Docker
```bash
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:latest start-dev
```

## 2. Configuration du Realm

1. Accédez à la console d'administration: http://localhost:8080/admin
2. Connectez-vous avec les identifiants admin/admin
3. Créez un nouveau realm nommé `PaiecashPlay`
   - Cliquez sur "Create Realm" dans le menu déroulant en haut à gauche
   - Entrez "PaiecashPlay" comme nom
   - Cliquez sur "Create"

## 3. Configuration du Client

1. Dans le realm `PaiecashPlay`, allez dans "Clients" dans le menu de gauche
2. Cliquez sur "Create client"
3. Configurez le client:
   - Client ID: `paiecashplay-fundation`
   - Client type: `OpenID Connect`
   - Cliquez sur "Next"
4. Activez les options:
   - Client authentication: ON
   - Authorization: ON
   - Cliquez sur "Next"
5. Configurez les redirections:
   - Valid redirect URIs: 
     - Pour le développement: `http://localhost:3000/*`
     - Pour la production: `https://fundation.paiecashplay.com/*`
   - Web origins: 
     - Pour le développement: `http://localhost:3000`
     - Pour la production: `https://fundation.paiecashplay.com`
   - Cliquez sur "Save"
6. Allez dans l'onglet "Credentials" du client
   - Copiez le "Client secret"
   - Collez-le dans vos fichiers `.env.development` et `.env.production` pour la variable `KEYCLOAK_CLIENT_SECRET`

## 4. Configuration des Rôles

1. Dans le realm `PaiecashPlay`, allez dans "Realm roles" dans le menu de gauche
2. Créez les rôles suivants (cliquez sur "Create role" pour chacun):
   - `admin`
   - `user`
   - `federation`
   - `club`
   - `player`

## 5. Configuration des Mappers pour le Client

1. Dans le client `paiecashplay-fundation`, allez dans l'onglet "Client scopes"
2. Cliquez sur le scope "paiecashplay-fundation-dedicated"
3. Allez dans l'onglet "Mappers"
4. Créez les mappers suivants:

### Mapper pour les rôles
1. Cliquez sur "Add mapper" > "By configuration"
2. Sélectionnez "User Realm Role"
3. Configurez:
   - Name: `realm-roles`
   - Token Claim Name: `roles`
   - Claim JSON Type: `String`
   - Add to ID token: ON
   - Add to access token: ON
   - Add to userinfo: ON
   - Multivalued: ON
4. Cliquez sur "Save"

### Mapper pour le prénom
1. Cliquez sur "Add mapper" > "By configuration"
2. Sélectionnez "User Property"
3. Configurez:
   - Name: `firstName`
   - User Property: `firstName`
   - Token Claim Name: `firstName`
   - Claim JSON Type: `String`
   - Add to ID token: ON
   - Add to access token: ON
   - Add to userinfo: ON
4. Cliquez sur "Save"

### Mapper pour le nom
1. Répétez les étapes ci-dessus pour créer un mapper pour "lastName"

### Mapper pour l'email
1. Répétez les étapes ci-dessus pour créer un mapper pour "email"

## 6. Vérification

### Pour le développement local

1. Assurez-vous que votre application est configurée avec les bonnes variables d'environnement dans `.env.development`:
   ```
   KEYCLOAK_BASE_URL=https://auth.paiecashplay.com
   KEYCLOAK_REALM=PaiecashPlay
   KEYCLOAK_CLIENT_ID=paiecashplay-fundation
   KEYCLOAK_CLIENT_SECRET=votre_client_secret
   NEXTAUTH_URL=http://localhost:3000
   URL_HOTE=http://localhost:3000
   ```

### Pour la production

1. Assurez-vous que votre application est configurée avec les bonnes variables d'environnement dans `.env.production`:
   ```
   KEYCLOAK_BASE_URL=https://auth.paiecashplay.com
   KEYCLOAK_REALM=PaiecashPlay
   KEYCLOAK_CLIENT_ID=paiecashplay-fundation
   KEYCLOAK_CLIENT_SECRET=votre_client_secret
   NEXTAUTH_URL=https://fundation.paiecashplay.com
   URL_HOTE=https://fundation.paiecashplay.com
   ```

2. Testez l'authentification en accédant à votre application et en cliquant sur "Se connecter" ou "Créer un compte"

## Résolution des problèmes courants

### Erreur "Unexpected error when handling authentication request to identity provider"

Cette erreur peut être causée par:

1. **URL de redirection incorrecte**: Vérifiez que l'URL de redirection dans votre application correspond exactement à celle configurée dans Keycloak.
   - Solution pour le développement: Assurez-vous que `http://localhost:3000/api/auth/callback` est bien dans les "Valid redirect URIs" du client Keycloak.
   - Solution pour la production: Assurez-vous que `https://fundation.paiecashplay.com/api/auth/callback` est bien dans les "Valid redirect URIs" du client Keycloak.

2. **Secret client incorrect**: Vérifiez que le secret client dans vos fichiers d'environnement correspond à celui généré dans Keycloak.
   - Solution: Copiez à nouveau le secret depuis l'onglet "Credentials" du client dans Keycloak et mettez-le à jour dans `.env.development` et `.env.production`.

3. **Problème de CORS**: Vérifiez que l'origine de votre application est autorisée dans Keycloak.
   - Solution pour le développement: Assurez-vous que `http://localhost:3000` est bien dans les "Web origins" du client Keycloak.
   - Solution pour la production: Assurez-vous que `https://fundation.paiecashplay.com` est bien dans les "Web origins" du client Keycloak.

4. **Keycloak inaccessible**: Vérifiez que Keycloak est bien accessible à l'URL configurée.
   - Solution: Assurez-vous que Keycloak est accessible à l'URL `https://auth.paiecashplay.com`.

### Erreur "Invalid redirect_uri"

Cette erreur se produit lorsque l'URL de redirection envoyée à Keycloak ne correspond pas à celles configurées.

- Solution pour le développement: Vérifiez que l'URL de redirection dans votre code (`${origin}/api/auth/callback`) correspond exactement à `http://localhost:3000/api/auth/callback` configurée dans Keycloak.
- Solution pour la production: Vérifiez que l'URL de redirection dans votre code (`${origin}/api/auth/callback`) correspond exactement à `https://fundation.paiecashplay.com/api/auth/callback` configurée dans Keycloak.

### Erreur "Invalid client_id"

Cette erreur se produit lorsque l'ID client envoyé à Keycloak est incorrect.

- Solution: Vérifiez que l'ID client dans votre fichier `.env.development` correspond à celui configuré dans Keycloak.