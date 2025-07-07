# Base de Données PaieCashPlay Fondation

## 📋 Vue d'ensemble

Cette base de données PostgreSQL structure toutes les données du système PaieCashPlay Fondation, remplaçant les données statiques actuellement utilisées dans le code.

## 📁 Structure des Fichiers

```
database/
├── README.md              # Ce fichier
├── MCD_PaieCashPlay.md    # Modèle Conceptuel de Données détaillé
├── MCD_Diagram.md         # Diagramme visuel avec Mermaid
├── schema.sql             # Script de création des tables
└── seed_data.sql          # Données de référence initiales
```

## 🚀 Installation

### 1. Prérequis
- PostgreSQL 14+ installé
- Extensions : `uuid-ossp`, `pg_trgm`

### 2. Création de la base
```bash
# Créer la base de données
createdb paiecashplay_fondation

# Se connecter à la base
psql -d paiecashplay_fondation
```

### 3. Exécution des scripts
```sql
-- 1. Créer le schéma complet
\i database/schema.sql

-- 2. Ajouter les fonctions d'authentification
\i database/auth_functions.sql

-- 3. Insérer les données de référence
\i database/seed_data.sql
```

## 🔧 Configuration Supabase

### Variables d'environnement à ajouter
```env
# Dans .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Migration vers Supabase
```bash
# Utiliser la CLI Supabase
supabase db reset
supabase db push
```

## 📊 Données Incluses

### Données de Référence
- ✅ **6 Zones CAF** (WAFU A/B, UNIFFAC, CECAFA, COSAFA, UNAF)
- ✅ **54 Pays africains** avec drapeaux et langues
- ✅ **54 Fédérations** correspondantes
- ✅ **4 Types de licences** (Standard, Solidaire, Académie, Ambassadeur)
- ✅ **5 Packs de donation** avec configurations complètes
- ✅ **Comptes par défaut** avec authentification sécurisée

### 🔐 Comptes de Test
- **Admin** : `admin@paiecash.com` / `Admin123!`
- **Utilisateur** : `test@paiecash.com` / `Test123!`

### Données à Ajouter
- 🔄 **Clubs** (à importer depuis les données existantes)
- 🔄 **Enfants** (à migrer depuis les composants)
- 🔄 **Utilisateurs** (à créer lors des inscriptions)

## 🔍 Requêtes Utiles

### Statistiques Dashboard
```sql
SELECT * FROM v_dashboard_stats;
```

### Enfants sans licence par pays
```sql
SELECT 
    p.nom as pays,
    p.flag_emoji,
    COUNT(e.id) as enfants_sans_licence
FROM enfants e
JOIN pays p ON e.pays_id = p.id
WHERE e.has_license = FALSE
GROUP BY p.nom, p.flag_emoji
ORDER BY enfants_sans_licence DESC;
```

### Top donateurs
```sql
SELECT 
    nom_complet,
    niveau_donateur,
    total_dons,
    nombre_enfants_parraines
FROM users 
WHERE statut = 'actif'
ORDER BY total_dons DESC
LIMIT 10;
```

### Répartition des dons par pack
```sql
SELECT 
    pd.nom,
    COUNT(d.id) as nombre_donations,
    SUM(d.montant) as total_collecte
FROM donations d
JOIN packs_donation pd ON d.pack_donation_id = pd.id
WHERE d.statut = 'complete'
GROUP BY pd.nom
ORDER BY total_collecte DESC;
```

## 🔄 Migration du Code Existant

### 1. Remplacer les données statiques

**Avant (données statiques) :**
```typescript
const federationsData = [
  { zone: 'ZONE OUEST A', countries: [...] }
];
```

**Après (base de données) :**
```typescript
const { data: federations } = await supabase
  .from('v_enfants_complets')
  .select('*')
  .eq('statut', 'actif');
```

### 2. Composants à modifier

#### `FederationsPage.tsx`
```typescript
// Remplacer les données statiques par :
const { data: federations } = await supabase
  .from('federations')
  .select(`
    *,
    pays:pays(*),
    clubs:clubs(count)
  `);
```

#### `ChildSelectionModal.tsx`
```typescript
// Remplacer availableChildren par :
const { data: enfants } = await supabase
  .from('v_enfants_complets')
  .select('*')
  .eq('has_license', false)
  .eq('statut', 'actif');
```

#### `LicensesPage.tsx`
```typescript
// Remplacer licensesData par :
const { data: licences } = await supabase
  .from('licences')
  .select(`
    *,
    enfant:enfants(*),
    type_licence:types_licences(*),
    club:clubs(*)
  `)
  .eq('statut', 'active');
```

## 🔒 Sécurité RLS (Row Level Security)

### Politiques recommandées
```sql
-- Enfants : lecture publique, modification admin
ALTER TABLE enfants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enfants lisibles par tous" ON enfants
  FOR SELECT USING (true);

CREATE POLICY "Enfants modifiables par admins" ON enfants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE email = auth.jwt() ->> 'email' 
      AND actif = true
    )
  );

-- Donations : utilisateur propriétaire uniquement
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Donations utilisateur" ON donations
  FOR ALL USING (
    user_id = auth.uid()
  );
```

## 📈 Performance

### Index créés automatiquement
- Recherche par nom d'enfant (GIN)
- Recherche par club (GIN)
- Filtres par statut
- Relations FK optimisées

### Monitoring recommandé
```sql
-- Requêtes lentes
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Taille des tables
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🔄 Maintenance

### Sauvegarde quotidienne
```bash
# Script de sauvegarde
pg_dump paiecashplay_fondation > backup_$(date +%Y%m%d).sql
```

### Nettoyage périodique
```sql
-- Supprimer les sessions Stripe expirées (> 24h)
DELETE FROM donations 
WHERE statut = 'en_attente' 
AND created_at < NOW() - INTERVAL '24 hours';

-- Archiver les statistiques anciennes (> 2 ans)
INSERT INTO statistiques_impact_archive 
SELECT * FROM statistiques_impact 
WHERE date_mesure < CURRENT_DATE - INTERVAL '2 years';
```

## 🆘 Support

### Logs utiles
```sql
-- Erreurs de contraintes
SELECT * FROM pg_stat_database_conflicts;

-- Connexions actives
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

### Contact
- 📧 Email : admin@paiecash.com
- 📱 Support technique : Équipe PaieCashPlay

---

**Note :** Cette base de données remplace complètement les données statiques du système actuel et permet une gestion dynamique et évolutive de toutes les informations.