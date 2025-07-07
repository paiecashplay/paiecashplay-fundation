# MCD (Modèle Conceptuel de Données) - PaieCashPlay Fondation

## 📊 Analyse des Données du Système

Basé sur l'analyse complète du code, voici le MCD complet pour structurer la base de données.

## 🏗️ Entités Principales

### 1. **ZONES_CAF**
- `id` (PK) : UUID
- `nom` : VARCHAR(100) - Ex: "ZONE OUEST A (WAFU A)"
- `code` : VARCHAR(20) - Ex: "WAFU_A"
- `description` : TEXT
- `created_at` : TIMESTAMP
- `updated_at` : TIMESTAMP

### 2. **PAYS**
- `id` (PK) : UUID
- `nom` : VARCHAR(100) - Ex: "SÉNÉGAL"
- `code_iso` : VARCHAR(3) - Ex: "SEN"
- `flag_emoji` : VARCHAR(10) - Ex: "🇸🇳"
- `langues` : TEXT[] - Ex: ["FR", "WO"]
- `zone_caf_id` (FK) : UUID → ZONES_CAF
- `created_at` : TIMESTAMP
- `updated_at` : TIMESTAMP

### 3. **FEDERATIONS**
- `id` (PK) : UUID
- `nom` : VARCHAR(100) - Ex: "FSF"
- `nom_complet` : VARCHAR(200) - Ex: "Fédération Sénégalaise de Football"
- `pays_id` (FK) : UUID → PAYS
- `site_web` : VARCHAR(255)
- `email` : VARCHAR(255)
- `telephone` : VARCHAR(50)
- `adresse` : TEXT
- `president` : VARCHAR(100)
- `created_at` : TIMESTAMP
- `updated_at` : TIMESTAMP

### 4. **CLUBS**
- `id` (PK) : UUID
- `nom` : VARCHAR(100) - Ex: "ASC Jaraaf"
- `ville` : VARCHAR(100)
- `adresse` : TEXT
- `federation_id` (FK) : UUID → FEDERATIONS
- `pays_id` (FK) : UUID → PAYS
- `email` : VARCHAR(255)
- `telephone` : VARCHAR(50)
- `president` : VARCHAR(100)
- `entraineur` : VARCHAR(100)
- `date_creation` : DATE
- `statut` : ENUM('actif', 'inactif', 'suspendu')
- `created_at` : TIMESTAMP
- `updated_at` : TIMESTAMP

### 5. **ENFANTS**
- `id` (PK) : UUID
- `nom` : VARCHAR(100)
- `prenom` : VARCHAR(100)
- `nom_complet` : VARCHAR(200) - Calculé
- `age` : INTEGER
- `date_naissance` : DATE
- `sexe` : ENUM('M', 'F')
- `position` : VARCHAR(50) - Ex: "Attaquant", "Défenseur"
- `photo_emoji` : VARCHAR(10) - Ex: "👦🏿"
- `photo_url` : VARCHAR(500)
- `club_id` (FK) : UUID → CLUBS
- `pays_id` (FK) : UUID → PAYS
- `federation_id` (FK) : UUID → FEDERATIONS
- `has_license` : BOOLEAN DEFAULT FALSE
- `statut` : ENUM('actif', 'inactif', 'diplômé')
- `biographie` : TEXT
- `reves_objectifs` : TEXT
- `created_at` : TIMESTAMP
- `updated_at` : TIMESTAMP

### 6. **TYPES_LICENCES**
- `id` (PK) : UUID
- `nom` : VARCHAR(100) - Ex: "Licence Solidaire"
- `code` : VARCHAR(50) - Ex: "SOLIDAIRE"
- `description` : TEXT
- `prix` : DECIMAL(10,2)
- `devise` : VARCHAR(3) DEFAULT 'EUR'
- `duree_mois` : INTEGER
- `couleur_badge` : VARCHAR(7) - Ex: "#4FBA73"
- `avantages` : TEXT[] - Liste des avantages
- `actif` : BOOLEAN DEFAULT TRUE
- `created_at` : TIMESTAMP
- `updated_at` : TIMESTAMP

### 7. **LICENCES**
- `id` (PK) : UUID
- `numero_licence` : VARCHAR(50) UNIQUE - Ex: "SEN2025001234"
- `enfant_id` (FK) : UUID → ENFANTS
- `type_licence_id` (FK) : UUID → TYPES_LICENCES
- `club_id` (FK) : UUID → CLUBS
- `federation_id` (FK) : UUID → FEDERATIONS
- `date_emission` : DATE
- `date_expiration` : DATE
- `statut` : ENUM('active', 'expiree', 'suspendue', 'annulee')
- `sponsor_id` (FK) : UUID → USERS (nullable)
- `montant_paye` : DECIMAL(10,2)
- `devise` : VARCHAR(3) DEFAULT 'EUR'
- `created_at` : TIMESTAMP
- `updated_at` : TIMESTAMP

### 8. **PACKS_DONATION**
- `id` (PK) : UUID
- `nom` : VARCHAR(100) - Ex: "License Solidaire"
- `code` : VARCHAR(50) - Ex: "licenseDream"
- `description` : TEXT
- `prix` : DECIMAL(10,2)
- `devise` : VARCHAR(3) DEFAULT 'EUR'
- `type_recurrence` : ENUM('unique', 'mensuel', 'annuel', 'saison')
- `icone_fa` : VARCHAR(50) - Ex: "faIdCard"
- `couleur_icone` : VARCHAR(7)
- `couleur_fond` : VARCHAR(7)
- `couleur_bouton` : VARCHAR(7)
- `avantages` : TEXT[]
- `actif` : BOOLEAN DEFAULT TRUE
- `ordre_affichage` : INTEGER
- `created_at` : TIMESTAMP
- `updated_at` : TIMESTAMP

### 9. **USERS** (Donateurs/Sponsors)
- `id` (PK) : UUID
- `email` : VARCHAR(255) UNIQUE
- `password_hash` : VARCHAR(255) NOT NULL
- `nom` : VARCHAR(100)
- `prenom` : VARCHAR(100)
- `nom_complet` : VARCHAR(200)
- `telephone` : VARCHAR(50)
- `pays` : VARCHAR(100)
- `ville` : VARCHAR(100)
- `adresse` : TEXT
- `date_naissance` : DATE
- `sexe` : ENUM('M', 'F', 'Autre')
- `profession` : VARCHAR(100)
- `photo_url` : VARCHAR(500)
- `niveau_donateur` : ENUM('Bronze', 'Argent', 'Or', 'Platine', 'Diamant')
- `total_dons` : DECIMAL(12,2) DEFAULT 0
- `nombre_enfants_parraines` : INTEGER DEFAULT 0
- `date_premier_don` : TIMESTAMP
- `statut` : ENUM('actif', 'inactif', 'suspendu')
- `preferences_communication` : JSONB
- `created_at` : TIMESTAMP
- `updated_at` : TIMESTAMP

### 10. **DONATIONS**
- `id` (PK) : UUID
- `user_id` (FK) : UUID → USERS
- `enfant_id` (FK) : UUID → ENFANTS (nullable)
- `pack_donation_id` (FK) : UUID → PACKS_DONATION (nullable)
- `montant` : DECIMAL(10,2)
- `devise` : VARCHAR(3) DEFAULT 'EUR'
- `type_don` : ENUM('unique', 'mensuel', 'annuel')
- `statut` : ENUM('en_attente', 'complete', 'echoue', 'rembourse', 'annule')
- `methode_paiement` : ENUM('stripe', 'paypal', 'virement', 'autre')
- `stripe_session_id` : VARCHAR(255)
- `stripe_payment_intent_id` : VARCHAR(255)
- `date_paiement` : TIMESTAMP
- `message_donateur` : TEXT
- `anonyme` : BOOLEAN DEFAULT FALSE
- `recu_fiscal_envoye` : BOOLEAN DEFAULT FALSE
- `created_at` : TIMESTAMP
- `updated_at` : TIMESTAMP

### 11. **PARRAINAGES**
- `id` (PK) : UUID
- `user_id` (FK) : UUID → USERS
- `enfant_id` (FK) : UUID → ENFANTS
- `pack_donation_id` (FK) : UUID → PACKS_DONATION
- `date_debut` : DATE
- `date_fin` : DATE (nullable)
- `statut` : ENUM('actif', 'suspendu', 'termine', 'annule')
- `montant_mensuel` : DECIMAL(10,2)
- `devise` : VARCHAR(3) DEFAULT 'EUR'
- `message_parrain` : TEXT
- `preferences_communication` : JSONB
- `created_at` : TIMESTAMP
- `updated_at` : TIMESTAMP

### 12. **CONTACTS**
- `id` (PK) : UUID
- `nom` : VARCHAR(100)
- `email` : VARCHAR(255)
- `telephone` : VARCHAR(50)
- `source` : VARCHAR(100) - Comment ils ont connu le projet
- `sujet` : VARCHAR(200)
- `message` : TEXT
- `statut` : ENUM('nouveau', 'en_cours', 'traite', 'ferme')
- `reponse` : TEXT
- `traite_par` : UUID (FK vers ADMINS)
- `date_traitement` : TIMESTAMP
- `created_at` : TIMESTAMP
- `updated_at` : TIMESTAMP

### 13. **NEWSLETTERS**
- `id` (PK) : UUID
- `email` : VARCHAR(255) UNIQUE
- `nom` : VARCHAR(100)
- `statut` : ENUM('actif', 'desabonne', 'bounce')
- `source` : VARCHAR(100)
- `preferences` : JSONB
- `date_inscription` : TIMESTAMP
- `date_desabonnement` : TIMESTAMP
- `created_at` : TIMESTAMP
- `updated_at` : TIMESTAMP

### 14. **STATISTIQUES_IMPACT**
- `id` (PK) : UUID
- `date_mesure` : DATE
- `enfants_soutenus` : INTEGER
- `clubs_affilies` : INTEGER
- `total_dons_collectes` : DECIMAL(12,2)
- `donateurs_actifs` : INTEGER
- `licences_emises` : INTEGER
- `equipements_distribues` : INTEGER
- `repas_fournis` : INTEGER
- `formations_dispensees` : INTEGER
- `created_at` : TIMESTAMP

### 15. **TEMOIGNAGES**
- `id` (PK) : UUID
- `enfant_id` (FK) : UUID → ENFANTS
- `user_id` (FK) : UUID → USERS (nullable)
- `titre` : VARCHAR(200)
- `contenu` : TEXT
- `type` : ENUM('enfant', 'donateur', 'club', 'parent')
- `photo_url` : VARCHAR(500)
- `video_url` : VARCHAR(500)
- `approuve` : BOOLEAN DEFAULT FALSE
- `affiche_site` : BOOLEAN DEFAULT FALSE
- `note` : INTEGER CHECK (note >= 1 AND note <= 5)
- `created_at` : TIMESTAMP
- `updated_at` : TIMESTAMP

### 16. **ADMINS**
- `id` (PK) : UUID
- `email` : VARCHAR(255) UNIQUE
- `password_hash` : VARCHAR(255) NOT NULL
- `nom` : VARCHAR(100)
- `prenom` : VARCHAR(100)
- `role` : ENUM('super_admin', 'admin', 'moderateur', 'lecteur')
- `permissions` : TEXT[]
- `derniere_connexion` : TIMESTAMP
- `actif` : BOOLEAN DEFAULT TRUE
- `created_at` : TIMESTAMP
- `updated_at` : TIMESTAMP

## 🔗 Relations Principales

### Relations 1:N (Un vers Plusieurs)
- **ZONES_CAF** → **PAYS** (Une zone contient plusieurs pays)
- **PAYS** → **FEDERATIONS** (Un pays a une fédération)
- **FEDERATIONS** → **CLUBS** (Une fédération gère plusieurs clubs)
- **CLUBS** → **ENFANTS** (Un club a plusieurs enfants)
- **USERS** → **DONATIONS** (Un utilisateur fait plusieurs dons)
- **USERS** → **PARRAINAGES** (Un utilisateur peut parrainer plusieurs enfants)

### Relations N:N (Plusieurs vers Plusieurs)
- **ENFANTS** ↔ **USERS** via **PARRAINAGES** (Un enfant peut avoir plusieurs parrains, un parrain peut soutenir plusieurs enfants)
- **PACKS_DONATION** ↔ **DONATIONS** (Un pack peut générer plusieurs donations)

### Relations 1:1 (Un vers Un)
- **ENFANTS** → **LICENCES** (Un enfant peut avoir une licence active)

## 📈 Vues Métier Recommandées

### Vue Enfants Complets
```sql
CREATE VIEW v_enfants_complets AS
SELECT 
    e.*,
    c.nom as club_nom,
    p.nom as pays_nom,
    p.flag_emoji,
    f.nom as federation_nom,
    l.numero_licence,
    l.statut as licence_statut,
    COUNT(par.id) as nombre_parrains,
    SUM(d.montant) as total_dons_recus
FROM enfants e
LEFT JOIN clubs c ON e.club_id = c.id
LEFT JOIN pays p ON e.pays_id = p.id
LEFT JOIN federations f ON e.federation_id = f.id
LEFT JOIN licences l ON e.id = l.enfant_id AND l.statut = 'active'
LEFT JOIN parrainages par ON e.id = par.enfant_id AND par.statut = 'actif'
LEFT JOIN donations d ON e.id = d.enfant_id AND d.statut = 'complete'
GROUP BY e.id, c.nom, p.nom, p.flag_emoji, f.nom, l.numero_licence, l.statut;
```

### Vue Statistiques Dashboard
```sql
CREATE VIEW v_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM enfants WHERE statut = 'actif') as enfants_actifs,
    (SELECT COUNT(*) FROM clubs WHERE statut = 'actif') as clubs_actifs,
    (SELECT COUNT(*) FROM users WHERE statut = 'actif') as donateurs_actifs,
    (SELECT SUM(montant) FROM donations WHERE statut = 'complete') as total_dons,
    (SELECT COUNT(*) FROM licences WHERE statut = 'active') as licences_actives,
    (SELECT COUNT(*) FROM parrainages WHERE statut = 'actif') as parrainages_actifs;
```

## 🔒 Sécurité et Contraintes

### Contraintes de Données
- Âge des enfants : entre 6 et 18 ans
- Montants : toujours positifs
- Emails : format valide
- Numéros de licence : uniques par fédération
- Dates d'expiration : postérieures aux dates d'émission

### Index Recommandés
```sql
-- Performance des recherches
CREATE INDEX idx_enfants_club_pays ON enfants(club_id, pays_id);
CREATE INDEX idx_donations_user_date ON donations(user_id, created_at);
CREATE INDEX idx_licences_numero ON licences(numero_licence);
CREATE INDEX idx_users_email ON users(email);

-- Recherche textuelle
CREATE INDEX idx_enfants_nom_complet ON enfants USING gin(to_tsvector('french', nom_complet));
CREATE INDEX idx_clubs_nom ON clubs USING gin(to_tsvector('french', nom));
```

### Triggers Recommandés
```sql
-- Mise à jour automatique du total des dons utilisateur
CREATE TRIGGER update_user_total_dons 
    AFTER INSERT OR UPDATE ON donations 
    FOR EACH ROW EXECUTE FUNCTION update_user_donation_stats();

-- Génération automatique du numéro de licence
CREATE TRIGGER generate_license_number 
    BEFORE INSERT ON licences 
    FOR EACH ROW EXECUTE FUNCTION generate_unique_license_number();
```

## 📊 Données de Référence à Insérer

### Zones CAF (6 zones)
### Pays (54 pays africains)
### Types de Licences (4 types)
### Packs de Donation (5 packs + personnalisé)

Ce MCD couvre toutes les données actuellement manipulées par le système et permet une évolutivité future.