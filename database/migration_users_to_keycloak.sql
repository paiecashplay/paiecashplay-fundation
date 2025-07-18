-- Script de migration de l'ancienne structure users vers la nouvelle structure Keycloak
-- À exécuter sur la base de données existante

-- Désactiver les contraintes de clés étrangères pendant la migration
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Créer une sauvegarde des données utilisateurs existantes
CREATE TABLE IF NOT EXISTS users_backup LIKE users;
INSERT INTO users_backup SELECT * FROM users;

-- 2. Migrer les utilisateurs vers user_profiles
INSERT INTO user_profiles (
    id,
    keycloak_id,
    user_type,
    phone,
    address,
    bio,
    avatar_url,
    preferences,
    created_at,
    updated_at
)
SELECT 
    id,
    CONCAT('migrated-', id) as keycloak_id, -- Créer un ID Keycloak temporaire
    'normal' as user_type,
    telephone as phone,
    adresse as address,
    bio,
    avatar_url,
    JSON_OBJECT('newsletter', recevoir_newsletter, 'language', 'fr') as preferences,
    created_at,
    updated_at
FROM users
WHERE statut = 'actif';

-- 3. Migrer les donations
-- Mettre à jour les références keycloak_id dans les donations
UPDATE donations d
JOIN users u ON d.user_id = u.id
SET d.keycloak_id = CONCAT('migrated-', u.id)
WHERE d.user_id IS NOT NULL;

-- 4. Migrer les parrainages
-- Mettre à jour les références keycloak_id dans les parrainages
UPDATE parrainages p
JOIN users u ON p.user_id = u.id
SET p.keycloak_id = CONCAT('migrated-', u.id)
WHERE p.user_id IS NOT NULL;

-- 5. Créer une vue pour faciliter la transition
CREATE OR REPLACE VIEW v_users_migration AS
SELECT 
    u.id as old_user_id,
    u.email,
    u.nom,
    u.prenom,
    u.statut as old_status,
    up.id as user_profile_id,
    up.keycloak_id,
    up.user_type
FROM users u
LEFT JOIN user_profiles up ON up.keycloak_id = CONCAT('migrated-', u.id);

-- Réactiver les contraintes de clés étrangères
SET FOREIGN_KEY_CHECKS = 1;

-- Afficher un message de confirmation
SELECT 'Migration des utilisateurs vers Keycloak terminée avec succès!' as message;