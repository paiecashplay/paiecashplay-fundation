-- Script d'installation pour Google Cloud SQL
-- Version simplifiée sans contraintes de clés étrangères initialement

-- Configuration
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';
SET FOREIGN_KEY_CHECKS = 0;

-- Supprimer les tables existantes
DROP TABLE IF EXISTS player_profiles;
DROP TABLE IF EXISTS club_profiles;
DROP TABLE IF EXISTS federation_profiles;
DROP TABLE IF EXISTS user_profiles;
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
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS newsletters;
DROP TABLE IF EXISTS statistiques_impact;

-- Supprimer les vues
DROP VIEW IF EXISTS v_user_complete_profiles;
DROP VIEW IF EXISTS v_enfants_complets;
DROP VIEW IF EXISTS v_dashboard_stats;

-- Création des tables sans contraintes de clés étrangères

-- 1. ZONES_CAF
CREATE TABLE zones_caf (
    id VARCHAR(36) PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. PAYS
CREATE TABLE pays (
    id VARCHAR(36) PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    code_iso VARCHAR(3) UNIQUE NOT NULL,
    flag_emoji VARCHAR(10),
    langues JSON,
    zone_caf_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. FEDERATIONS
CREATE TABLE federations (
    id VARCHAR(36) PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    nom_complet VARCHAR(200),
    pays_id VARCHAR(36) NOT NULL,
    site_web VARCHAR(255),
    email VARCHAR(255),
    telephone VARCHAR(50),
    adresse TEXT,
    president VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. CLUBS
CREATE TABLE clubs (
    id VARCHAR(36) PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    ville VARCHAR(100),
    adresse TEXT,
    federation_id VARCHAR(36) NOT NULL,
    pays_id VARCHAR(36) NOT NULL,
    email VARCHAR(255),
    telephone VARCHAR(50),
    president VARCHAR(100),
    entraineur VARCHAR(100),
    date_creation DATE,
    statut ENUM('actif', 'inactif', 'suspendu') DEFAULT 'actif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. TYPES_LICENCES
CREATE TABLE types_licences (
    id VARCHAR(36) PRIMARY KEY,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. PACKS_DONATION
CREATE TABLE packs_donation (
    id VARCHAR(36) PRIMARY KEY,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 7. PROFILS UTILISATEURS KEYCLOAK
CREATE TABLE user_profiles (
    id VARCHAR(36) PRIMARY KEY,
    keycloak_id VARCHAR(255) UNIQUE NOT NULL,
    user_type ENUM('normal', 'federation', 'club', 'player') NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    bio TEXT,
    avatar_url VARCHAR(500),
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_keycloak_id (keycloak_id),
    INDEX idx_user_type (user_type)
);

-- 8. PROFILS FÉDÉRATION
CREATE TABLE federation_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_profile_id VARCHAR(36) NOT NULL,
    federation_code VARCHAR(20),
    president_name VARCHAR(100),
    website VARCHAR(255),
    official_email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    logo_url VARCHAR(500),
    description TEXT,
    social_links JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_federation_code (federation_code)
);

-- 9. PROFILS CLUB
CREATE TABLE club_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_profile_id VARCHAR(36) NOT NULL,
    club_code VARCHAR(20),
    president_name VARCHAR(100),
    coach_name VARCHAR(100),
    founded_year YEAR,
    website VARCHAR(255),
    official_email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    logo_url VARCHAR(500),
    description TEXT,
    social_links JSON,
    federation_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_club_code (club_code)
);

-- 10. PROFILS JOUEUR
CREATE TABLE player_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_profile_id VARCHAR(36) NOT NULL,
    player_number VARCHAR(10),
    position VARCHAR(50),
    height INT,
    weight INT,
    preferred_foot ENUM('left', 'right', 'both'),
    date_of_birth DATE,
    place_of_birth VARCHAR(100),
    nationality VARCHAR(100),
    club_id VARCHAR(36),
    parent_contact VARCHAR(255),
    emergency_contact VARCHAR(255),
    medical_info TEXT,
    achievements TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 11. ENFANTS
CREATE TABLE enfants (
    id VARCHAR(36) PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    date_naissance DATE,
    sexe ENUM('M', 'F'),
    position VARCHAR(50),
    photo_emoji VARCHAR(10),
    photo_url VARCHAR(500),
    club_id VARCHAR(36) NOT NULL,
    pays_id VARCHAR(36) NOT NULL,
    federation_id VARCHAR(36) NOT NULL,
    has_license BOOLEAN DEFAULT FALSE,
    statut ENUM('actif', 'inactif', 'diplome') DEFAULT 'actif',
    biographie TEXT,
    reves_objectifs TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 12. LICENCES
CREATE TABLE licences (
    id VARCHAR(36) PRIMARY KEY,
    numero_licence VARCHAR(50) UNIQUE NOT NULL,
    enfant_id VARCHAR(36) NOT NULL,
    type_licence_id VARCHAR(36) NOT NULL,
    club_id VARCHAR(36) NOT NULL,
    federation_id VARCHAR(36) NOT NULL,
    date_emission DATE NOT NULL,
    date_expiration DATE NOT NULL,
    statut ENUM('active', 'expiree', 'suspendue', 'annulee') DEFAULT 'active',
    keycloak_id VARCHAR(255),
    montant_paye DECIMAL(10,2) NOT NULL,
    devise VARCHAR(3) DEFAULT 'EUR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_keycloak_licences (keycloak_id)
);

-- 13. DONATIONS
CREATE TABLE donations (
    id VARCHAR(36) PRIMARY KEY,
    keycloak_id VARCHAR(255),
    enfant_id VARCHAR(36),
    pack_donation_id VARCHAR(36),
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
    INDEX idx_keycloak_donations (keycloak_id)
);

-- 14. PARRAINAGES
CREATE TABLE parrainages (
    id VARCHAR(36) PRIMARY KEY,
    keycloak_id VARCHAR(255),
    enfant_id VARCHAR(36) NOT NULL,
    pack_donation_id VARCHAR(36) NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE,
    statut ENUM('actif', 'suspendu', 'termine', 'annule') DEFAULT 'actif',
    montant_mensuel DECIMAL(10,2) NOT NULL,
    devise VARCHAR(3) DEFAULT 'EUR',
    message_parrain TEXT,
    preferences_communication JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_keycloak_parrainages (keycloak_id)
);

-- 15. ADMINS
CREATE TABLE admins (
    id VARCHAR(36) PRIMARY KEY,
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
);

-- 16. CONTACTS
CREATE TABLE contacts (
    id VARCHAR(36) PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(50),
    source VARCHAR(100),
    sujet VARCHAR(200),
    message TEXT NOT NULL,
    statut ENUM('nouveau', 'en_cours', 'traite', 'ferme') DEFAULT 'nouveau',
    reponse TEXT,
    traite_par VARCHAR(255),
    date_traitement TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 17. NEWSLETTERS
CREATE TABLE newsletters (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nom VARCHAR(100),
    statut ENUM('actif', 'desabonne', 'bounce') DEFAULT 'actif',
    source VARCHAR(100),
    preferences JSON,
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_desabonnement TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 18. STATISTIQUES_IMPACT
CREATE TABLE statistiques_impact (
    id VARCHAR(36) PRIMARY KEY,
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
);

-- Ajout des clés étrangères après création des tables
ALTER TABLE pays ADD CONSTRAINT fk_pays_zone FOREIGN KEY (zone_caf_id) REFERENCES zones_caf(id) ON DELETE SET NULL;
ALTER TABLE federations ADD CONSTRAINT fk_federations_pays FOREIGN KEY (pays_id) REFERENCES pays(id) ON DELETE CASCADE;
ALTER TABLE clubs ADD CONSTRAINT fk_clubs_federation FOREIGN KEY (federation_id) REFERENCES federations(id) ON DELETE CASCADE;
ALTER TABLE clubs ADD CONSTRAINT fk_clubs_pays FOREIGN KEY (pays_id) REFERENCES pays(id) ON DELETE CASCADE;
ALTER TABLE federation_profiles ADD CONSTRAINT fk_federation_profile FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
ALTER TABLE club_profiles ADD CONSTRAINT fk_club_profile FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
ALTER TABLE club_profiles ADD CONSTRAINT fk_club_federation FOREIGN KEY (federation_id) REFERENCES federations(id) ON DELETE SET NULL;
ALTER TABLE player_profiles ADD CONSTRAINT fk_player_profile FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
ALTER TABLE player_profiles ADD CONSTRAINT fk_player_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL;
ALTER TABLE enfants ADD CONSTRAINT fk_enfants_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;
ALTER TABLE enfants ADD CONSTRAINT fk_enfants_pays FOREIGN KEY (pays_id) REFERENCES pays(id) ON DELETE CASCADE;
ALTER TABLE enfants ADD CONSTRAINT fk_enfants_federation FOREIGN KEY (federation_id) REFERENCES federations(id) ON DELETE CASCADE;
ALTER TABLE licences ADD CONSTRAINT fk_licences_enfant FOREIGN KEY (enfant_id) REFERENCES enfants(id) ON DELETE CASCADE;
ALTER TABLE licences ADD CONSTRAINT fk_licences_type FOREIGN KEY (type_licence_id) REFERENCES types_licences(id) ON DELETE CASCADE;
ALTER TABLE licences ADD CONSTRAINT fk_licences_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;
ALTER TABLE licences ADD CONSTRAINT fk_licences_federation FOREIGN KEY (federation_id) REFERENCES federations(id) ON DELETE CASCADE;
ALTER TABLE donations ADD CONSTRAINT fk_donations_enfant FOREIGN KEY (enfant_id) REFERENCES enfants(id) ON DELETE SET NULL;
ALTER TABLE donations ADD CONSTRAINT fk_donations_pack FOREIGN KEY (pack_donation_id) REFERENCES packs_donation(id) ON DELETE SET NULL;
ALTER TABLE parrainages ADD CONSTRAINT fk_parrainages_enfant FOREIGN KEY (enfant_id) REFERENCES enfants(id) ON DELETE CASCADE;
ALTER TABLE parrainages ADD CONSTRAINT fk_parrainages_pack FOREIGN KEY (pack_donation_id) REFERENCES packs_donation(id) ON DELETE CASCADE;

-- Création des vues
CREATE VIEW v_user_complete_profiles AS
SELECT 
    up.id,
    up.keycloak_id,
    up.user_type,
    up.phone,
    up.address,
    up.bio,
    up.avatar_url,
    up.preferences,
    fp.federation_code,
    fp.president_name as federation_president,
    cp.club_code,
    cp.president_name as club_president,
    cp.coach_name,
    pp.player_number,
    pp.position,
    pp.date_of_birth,
    up.created_at,
    up.updated_at
FROM user_profiles up
LEFT JOIN federation_profiles fp ON up.id = fp.user_profile_id
LEFT JOIN club_profiles cp ON up.id = cp.user_profile_id  
LEFT JOIN player_profiles pp ON up.id = pp.user_profile_id;

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
    (SELECT COUNT(*) FROM user_profiles) as donateurs_actifs,
    (SELECT COALESCE(SUM(montant), 0) FROM donations WHERE statut = 'complete') as total_dons,
    (SELECT COUNT(*) FROM licences WHERE statut = 'active') as licences_actives,
    (SELECT COUNT(*) FROM parrainages WHERE statut = 'actif') as parrainages_actifs;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Installation du schéma complet terminée avec succès!' as message;