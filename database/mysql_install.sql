-- Script d'installation complet MySQL pour PaieCashPlay Fondation
-- Compatible avec MySQL 5.7+ et 8.0+

-- Vérification de la version MySQL
SELECT VERSION() as mysql_version;

-- Configuration pour compatibilité
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';
SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;

-- Début de transaction
START TRANSACTION;

-- Supprimer les tables existantes si elles existent (ordre inverse des dépendances)
DROP TABLE IF EXISTS parrainages;
DROP TABLE IF EXISTS donations;
DROP TABLE IF EXISTS licences;
DROP TABLE IF EXISTS enfants;
DROP TABLE IF EXISTS clubs;
DROP TABLE IF EXISTS federations;
DROP TABLE IF EXISTS pays;
DROP TABLE IF EXISTS zones_caf;
DROP TABLE IF EXISTS types_licences;
DROP TABLE IF EXISTS packs_donation;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS newsletters;
DROP TABLE IF EXISTS statistiques_impact;

-- Supprimer les vues si elles existent
DROP VIEW IF EXISTS v_enfants_complets;
DROP VIEW IF EXISTS v_dashboard_stats;

-- 1. ZONES_CAF
CREATE TABLE zones_caf (
    id CHAR(36) PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. PAYS
CREATE TABLE pays (
    id CHAR(36) PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    code_iso VARCHAR(3) UNIQUE NOT NULL,
    flag_emoji VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    langues JSON,
    zone_caf_id CHAR(36) ,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pays_zone FOREIGN KEY (zone_caf_id) REFERENCES zones_caf(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 3. FEDERATIONS
CREATE TABLE federations (
    id CHAR(36) PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    nom_complet VARCHAR(200),
    pays_id CHAR(36) NOT NULL,
    site_web VARCHAR(255),
    email VARCHAR(255),
    telephone VARCHAR(50),
    adresse TEXT,
    president VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_federations_pays FOREIGN KEY (pays_id) REFERENCES pays(id) ON DELETE CASCADE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CLUBS
CREATE TABLE clubs (
    id CHAR(36) PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    ville VARCHAR(100),
    adresse TEXT,
    federation_id CHAR(36) NOT NULL,
    pays_id CHAR(36) NOT NULL,
    email VARCHAR(255),
    telephone VARCHAR(50),
    president VARCHAR(100),
    entraineur VARCHAR(100),
    date_creation DATE,
    statut ENUM('actif', 'inactif', 'suspendu') DEFAULT 'actif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_clubs_federation FOREIGN KEY (federation_id) REFERENCES federations(id) ON DELETE CASCADE,
    CONSTRAINT fk_clubs_pays FOREIGN KEY (pays_id) REFERENCES pays(id) ON DELETE CASCADE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TYPES_LICENCES
CREATE TABLE types_licences (
    id CHAR(36) PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    prix DECIMAL(10,2) NOT NULL,
    devise VARCHAR(3) DEFAULT 'EUR',
    duree_mois INT NOT NULL,
    couleur_badge VARCHAR(7),
    avantages JSON,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_prix_positif CHECK (prix >= 0),
    CONSTRAINT chk_duree_positive CHECK (duree_mois > 0)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. PACKS_DONATION
CREATE TABLE packs_donation (
    id CHAR(36) PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    prix DECIMAL(10,2) NOT NULL,
    devise VARCHAR(3) DEFAULT 'EUR',
    type_recurrence ENUM('unique', 'mensuel', 'annuel', 'saison') DEFAULT 'unique',
    icone_fa VARCHAR(50),
    couleur_icone VARCHAR(7),
    couleur_fond VARCHAR(7),
    couleur_bouton VARCHAR(7),
    avantages JSON,
    actif BOOLEAN DEFAULT TRUE,
    ordre_affichage INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_pack_prix_positif CHECK (prix >= 0)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. USERS
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    telephone VARCHAR(50),
    pays VARCHAR(100),
    ville VARCHAR(100),
    adresse TEXT,
    date_naissance DATE,
    sexe ENUM('M', 'F', 'Autre'),
    profession VARCHAR(100),
    photo_url VARCHAR(500),
    niveau_donateur ENUM('Bronze', 'Argent', 'Or', 'Platine', 'Diamant') DEFAULT 'Bronze',
    total_dons DECIMAL(12,2) DEFAULT 0.00,
    nombre_enfants_parraines INT DEFAULT 0,
    date_premier_don TIMESTAMP NULL,
    statut ENUM('actif', 'inactif', 'suspendu') DEFAULT 'actif',
    preferences_communication JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_total_dons_positif CHECK (total_dons >= 0),
    CONSTRAINT chk_enfants_parraines_positif CHECK (nombre_enfants_parraines >= 0)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. ENFANTS
CREATE TABLE enfants (
    id CHAR(36) PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    date_naissance DATE,
    sexe ENUM('M', 'F'),
    position VARCHAR(50),
    photo_emoji VARCHAR(10),
    photo_url VARCHAR(500),
    club_id CHAR(36) NOT NULL,
    pays_id CHAR(36) NOT NULL,
    federation_id CHAR(36) NOT NULL,
    has_license BOOLEAN DEFAULT FALSE,
    statut ENUM('actif', 'inactif', 'diplome') DEFAULT 'actif',
    biographie TEXT,
    reves_objectifs TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_enfants_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    CONSTRAINT fk_enfants_pays FOREIGN KEY (pays_id) REFERENCES pays(id) ON DELETE CASCADE,
    CONSTRAINT fk_enfants_federation FOREIGN KEY (federation_id) REFERENCES federations(id) ON DELETE CASCADE,
    CONSTRAINT chk_age_valide CHECK (age >= 6 AND age <= 18)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. LICENCES
CREATE TABLE licences (
    id CHAR(36) PRIMARY KEY,
    numero_licence VARCHAR(50) UNIQUE NOT NULL,
    enfant_id CHAR(36) NOT NULL,
    type_licence_id CHAR(36) NOT NULL,
    club_id CHAR(36) NOT NULL,
    federation_id CHAR(36) NOT NULL,
    date_emission DATE NOT NULL,
    date_expiration DATE NOT NULL,
    statut ENUM('active', 'expiree', 'suspendue', 'annulee') DEFAULT 'active',
    sponsor_id CHAR(36),
    montant_paye DECIMAL(10,2) NOT NULL,
    devise VARCHAR(3) DEFAULT 'EUR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_licences_enfant FOREIGN KEY (enfant_id) REFERENCES enfants(id) ON DELETE CASCADE,
    CONSTRAINT fk_licences_type FOREIGN KEY (type_licence_id) REFERENCES types_licences(id) ON DELETE CASCADE,
    CONSTRAINT fk_licences_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    CONSTRAINT fk_licences_federation FOREIGN KEY (federation_id) REFERENCES federations(id) ON DELETE CASCADE,
    CONSTRAINT fk_licences_sponsor FOREIGN KEY (sponsor_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_montant_positif CHECK (montant_paye >= 0),
    CONSTRAINT chk_date_expiration CHECK (date_expiration > date_emission)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. DONATIONS
CREATE TABLE donations (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    enfant_id CHAR(36),
    pack_donation_id CHAR(36),
    montant DECIMAL(10,2) NOT NULL,
    devise VARCHAR(3) DEFAULT 'EUR',
    type_don ENUM('unique', 'mensuel', 'annuel') DEFAULT 'unique',
    statut ENUM('en_attente', 'complete', 'echoue', 'rembourse', 'annule') DEFAULT 'en_attente',
    methode_paiement ENUM('stripe', 'paypal', 'virement', 'autre'),
    stripe_session_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    date_paiement TIMESTAMP NULL,
    message_donateur TEXT,
    anonyme BOOLEAN DEFAULT FALSE,
    recu_fiscal_envoye BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_donations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_donations_enfant FOREIGN KEY (enfant_id) REFERENCES enfants(id) ON DELETE SET NULL,
    CONSTRAINT fk_donations_pack FOREIGN KEY (pack_donation_id) REFERENCES packs_donation(id) ON DELETE SET NULL,
    CONSTRAINT chk_montant_don_positif CHECK (montant > 0)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. PARRAINAGES
CREATE TABLE parrainages (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    enfant_id CHAR(36) NOT NULL,
    pack_donation_id CHAR(36) NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE,
    statut ENUM('actif', 'suspendu', 'termine', 'annule') DEFAULT 'actif',
    montant_mensuel DECIMAL(10,2) NOT NULL,
    devise VARCHAR(3) DEFAULT 'EUR',
    message_parrain TEXT,
    preferences_communication JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_parrainages_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_parrainages_enfant FOREIGN KEY (enfant_id) REFERENCES enfants(id) ON DELETE CASCADE,
    CONSTRAINT fk_parrainages_pack FOREIGN KEY (pack_donation_id) REFERENCES packs_donation(id) ON DELETE CASCADE,
    CONSTRAINT chk_montant_mensuel_positif CHECK (montant_mensuel > 0),
    CONSTRAINT chk_date_fin_valide CHECK (date_fin IS NULL OR date_fin >= date_debut)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. CONTACTS
CREATE TABLE contacts (
    id CHAR(36) PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(50),
    source VARCHAR(100),
    sujet VARCHAR(200),
    message TEXT NOT NULL,
    statut ENUM('nouveau', 'en_cours', 'traite', 'ferme') DEFAULT 'nouveau',
    reponse TEXT,
    traite_par CHAR(36),
    date_traitement TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. NEWSLETTERS
CREATE TABLE newsletters (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nom VARCHAR(100),
    statut ENUM('actif', 'desabonne', 'bounce') DEFAULT 'actif',
    source VARCHAR(100),
    preferences JSON,
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_desabonnement TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. STATISTIQUES_IMPACT
CREATE TABLE statistiques_impact (
    id CHAR(36) PRIMARY KEY,
    date_mesure DATE NOT NULL,
    enfants_soutenus INT DEFAULT 0,
    clubs_affilies INT DEFAULT 0,
    total_dons_collectes DECIMAL(12,2) DEFAULT 0.00,
    donateurs_actifs INT DEFAULT 0,
    licences_emises INT DEFAULT 0,
    equipements_distribues INT DEFAULT 0,
    repas_fournis INT DEFAULT 0,
    formations_dispensees INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_date_mesure (date_mesure)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. ADMINS
CREATE TABLE admins (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    role ENUM('super_admin', 'admin', 'moderateur', 'lecteur') DEFAULT 'lecteur',
    permissions JSON,
    derniere_connexion TIMESTAMP NULL,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INDEX POUR PERFORMANCE
CREATE INDEX idx_enfants_club_pays ON enfants(club_id, pays_id);
CREATE INDEX idx_donations_user_date ON donations(user_id, created_at);
CREATE INDEX idx_licences_numero ON licences(numero_licence);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_donations_statut ON donations(statut);
CREATE INDEX idx_parrainages_actifs ON parrainages(statut);
CREATE INDEX idx_enfants_nom ON enfants(nom, prenom);
CREATE INDEX idx_clubs_nom ON clubs(nom);
CREATE INDEX idx_pays_zone ON pays(zone_caf_id);
CREATE INDEX idx_federations_pays ON federations(pays_id);

-- VUES
CREATE VIEW v_enfants_complets AS
SELECT 
    e.*,
    c.nom as club_nom,
    p.nom as pays_nom,
    p.flag_emoji,
    f.nom as federation_nom,
    l.numero_licence,
    l.statut as licence_statut,
    (SELECT COUNT(*) FROM parrainages par WHERE par.enfant_id = e.id AND par.statut = 'actif') as nombre_parrains,
    COALESCE((SELECT SUM(d.montant) FROM donations d WHERE d.enfant_id = e.id AND d.statut = 'complete'), 0) as total_dons_recus
FROM enfants e
LEFT JOIN clubs c ON e.club_id = c.id
LEFT JOIN pays p ON e.pays_id = p.id
LEFT JOIN federations f ON e.federation_id = f.id
LEFT JOIN licences l ON e.id = l.enfant_id AND l.statut = 'active';

CREATE VIEW v_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM enfants WHERE statut = 'actif') as enfants_actifs,
    (SELECT COUNT(*) FROM clubs WHERE statut = 'actif') as clubs_actifs,
    (SELECT COUNT(*) FROM users WHERE statut = 'actif') as donateurs_actifs,
    (SELECT COALESCE(SUM(montant), 0) FROM donations WHERE statut = 'complete') as total_dons,
    (SELECT COUNT(*) FROM licences WHERE statut = 'active') as licences_actives,
    (SELECT COUNT(*) FROM parrainages WHERE statut = 'actif') as parrainages_actifs;

-- Validation de la création des tables
SELECT 'Tables créées avec succès' as status;
SELECT COUNT(*) as nombre_tables FROM information_schema.tables WHERE table_schema = DATABASE();

-- Commit de la transaction
COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
SET AUTOCOMMIT = 1;

SELECT 'Installation du schéma terminée avec succès!' as message;