# Configuration Google Cloud SQL

## 1. Prérequis
- Instance Cloud SQL MySQL créée
- Fichier JSON de clé de service téléchargé
- Cloud SQL Proxy installé (optionnel pour développement local)

## 2. Configuration des variables d'environnement

Créez un fichier `.env.local` avec :

```env
# Configuration Google Cloud SQL
# Pour connexion via socket Unix (production sur Google Cloud)
DB_SOCKET_PATH=/cloudsql/YOUR_PROJECT_ID:YOUR_REGION:YOUR_INSTANCE_NAME

# Pour connexion TCP (développement local ou via proxy)
DB_HOST=127.0.0.1
DB_PORT=3306

# Informations de connexion
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_database_name

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Environment
NODE_ENV=development

# Google Cloud Service Account
GOOGLE_APPLICATION_CREDENTIALS=./path/to/your/service-account-key.json
```

## 3. Migration vers Cloud SQL

Pour migrer, remplacez dans tous les fichiers qui importent la base de données :

```typescript
// Ancien import
import { executeQuery } from '@/lib/database';

// Nouveau import  
import { executeQuery } from '@/lib/database-cloudsql';
```

## 4. Fichiers à modifier :
- `lib/auth.ts`
- `lib/services/donationService.ts`
- Toutes les routes API dans `app/api/`

## 5. Test de connexion

Visitez `/api/auth/test` pour tester la connexion après configuration.