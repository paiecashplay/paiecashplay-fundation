# Exemples d'Authentification - PaieCashPlay Fondation

## 🔐 Comptes par Défaut

### Admin Principal
- **Email** : `admin@paiecash.com`
- **Mot de passe** : `Admin123!`
- **Rôle** : Super Admin

### Utilisateur Test
- **Email** : `test@paiecash.com`
- **Mot de passe** : `Test123!`
- **Statut** : Utilisateur actif

## 🛠️ Utilisation des Fonctions

### 1. Authentification Utilisateur
```sql
-- Connexion utilisateur
SELECT * FROM authenticate_user('test@paiecash.com', 'Test123!');

-- Résultat attendu :
-- user_id | email | nom | prenom | niveau_donateur | statut
-- uuid... | test@paiecash.com | Test | User | Bronze | actif
```

### 2. Authentification Admin
```sql
-- Connexion admin
SELECT * FROM authenticate_admin('admin@paiecash.com', 'Admin123!');

-- Résultat attendu :
-- admin_id | email | nom | prenom | role | permissions
-- uuid... | admin@paiecash.com | Admin | Super | super_admin | {all_permissions,...}
```

### 3. Création d'un Nouvel Utilisateur
```sql
-- Créer un utilisateur
SELECT create_user(
    'nouveau@example.com',
    'MotDePasse123!',
    'Dupont',
    'Jean',
    '+33123456789',
    'France',
    'Lyon'
);
```

### 4. Changement de Mot de Passe
```sql
-- Changer le mot de passe (utilisateur connecté)
SELECT change_user_password(
    'user-uuid-here',
    'AncienMotDePasse123!',
    'NouveauMotDePasse123!'
);
```

### 5. Réinitialisation par Admin
```sql
-- Réinitialiser le mot de passe d'un utilisateur (admin uniquement)
SELECT reset_user_password(
    'utilisateur@example.com',
    'NouveauMotDePasse123!',
    'admin-uuid-here'
);
```

## 🔒 Sécurité

### Hachage des Mots de Passe
- **Algorithme** : bcrypt avec salt de 12 rounds
- **Fonction** : `hash_password(password)`
- **Vérification** : `verify_password(password, hash)`

### Règles de Mot de Passe Recommandées
- Minimum 8 caractères
- Au moins 1 majuscule
- Au moins 1 minuscule  
- Au moins 1 chiffre
- Au moins 1 caractère spécial

### Exemple de Validation (côté application)
```javascript
function validatePassword(password) {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && 
           hasUpper && hasLower && hasNumber && hasSpecial;
}
```

## 🚀 Intégration Next.js

### 1. API Route de Connexion
```typescript
// app/api/auth/login/route.ts
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    const { email, password } = await request.json();
    
    const { data, error } = await supabase
        .rpc('authenticate_user', {
            user_email: email,
            user_password: password
        });
    
    if (error || !data.length) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Créer session JWT ou cookie
    return Response.json({ user: data[0] });
}
```

### 2. API Route d'Inscription
```typescript
// app/api/auth/register/route.ts
export async function POST(request: Request) {
    const { email, password, nom, prenom } = await request.json();
    
    const { data, error } = await supabase
        .rpc('create_user', {
            user_email: email,
            user_password: password,
            user_nom: nom,
            user_prenom: prenom
        });
    
    if (error) {
        return Response.json({ error: error.message }, { status: 400 });
    }
    
    return Response.json({ userId: data });
}
```

### 3. Middleware de Protection
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth-token');
    
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }
    
    return NextResponse.next();
}
```

## 📱 Utilisation Frontend

### Hook d'Authentification
```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const login = async (email: string, password: string) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            return data.user;
        }
        throw new Error('Login failed');
    };
    
    const logout = () => {
        setUser(null);
        // Supprimer cookie/token
    };
    
    return { user, login, logout, loading };
}
```

## 🔧 Tests

### Test de Connexion
```sql
-- Test connexion valide
SELECT 'Test connexion admin' as test,
       CASE WHEN EXISTS(
           SELECT 1 FROM authenticate_admin('admin@paiecash.com', 'Admin123!')
       ) THEN 'PASS' ELSE 'FAIL' END as result;

-- Test connexion invalide
SELECT 'Test mot de passe incorrect' as test,
       CASE WHEN NOT EXISTS(
           SELECT 1 FROM authenticate_admin('admin@paiecash.com', 'WrongPassword')
       ) THEN 'PASS' ELSE 'FAIL' END as result;
```

### Test de Création Utilisateur
```sql
-- Test création utilisateur
DO $$
DECLARE
    new_id UUID;
BEGIN
    SELECT create_user('test-creation@example.com', 'TestPass123!', 'Test', 'Creation') INTO new_id;
    
    IF new_id IS NOT NULL THEN
        RAISE NOTICE 'Test création utilisateur: PASS (ID: %)', new_id;
    ELSE
        RAISE NOTICE 'Test création utilisateur: FAIL';
    END IF;
END $$;
```

## 🛡️ Bonnes Pratiques

1. **Jamais stocker les mots de passe en clair**
2. **Utiliser HTTPS en production**
3. **Implémenter la limitation de tentatives**
4. **Logger les tentatives de connexion**
5. **Expirer les sessions après inactivité**
6. **Utiliser des tokens JWT sécurisés**
7. **Implémenter la double authentification (2FA)**