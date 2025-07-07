-- Fonctions d'authentification pour PaieCashPlay Fondation

-- Extension pour le hachage des mots de passe
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Fonction pour hasher un mot de passe
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN crypt(password, gen_salt('bf', 12));
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier un mot de passe
CREATE OR REPLACE FUNCTION verify_password(password TEXT, hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN hash = crypt(password, hash);
END;
$$ LANGUAGE plpgsql;

-- Fonction d'authentification utilisateur
CREATE OR REPLACE FUNCTION authenticate_user(user_email TEXT, user_password TEXT)
RETURNS TABLE(
    user_id UUID,
    email VARCHAR(255),
    nom VARCHAR(100),
    prenom VARCHAR(100),
    niveau_donateur VARCHAR(20),
    statut VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.nom,
        u.prenom,
        u.niveau_donateur,
        u.statut
    FROM users u
    WHERE u.email = user_email 
    AND verify_password(user_password, u.password_hash)
    AND u.statut = 'actif';
END;
$$ LANGUAGE plpgsql;

-- Fonction d'authentification admin
CREATE OR REPLACE FUNCTION authenticate_admin(admin_email TEXT, admin_password TEXT)
RETURNS TABLE(
    admin_id UUID,
    email VARCHAR(255),
    nom VARCHAR(100),
    prenom VARCHAR(100),
    role VARCHAR(20),
    permissions TEXT[]
) AS $$
BEGIN
    -- Mettre à jour la dernière connexion
    UPDATE admins 
    SET derniere_connexion = NOW() 
    WHERE email = admin_email 
    AND verify_password(admin_password, password_hash)
    AND actif = TRUE;
    
    RETURN QUERY
    SELECT 
        a.id,
        a.email,
        a.nom,
        a.prenom,
        a.role,
        a.permissions
    FROM admins a
    WHERE a.email = admin_email 
    AND verify_password(admin_password, a.password_hash)
    AND a.actif = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer un nouvel utilisateur
CREATE OR REPLACE FUNCTION create_user(
    user_email TEXT,
    user_password TEXT,
    user_nom TEXT DEFAULT NULL,
    user_prenom TEXT DEFAULT NULL,
    user_telephone TEXT DEFAULT NULL,
    user_pays TEXT DEFAULT NULL,
    user_ville TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
BEGIN
    INSERT INTO users (
        email, 
        password_hash, 
        nom, 
        prenom, 
        telephone, 
        pays, 
        ville,
        statut
    ) VALUES (
        user_email,
        hash_password(user_password),
        user_nom,
        user_prenom,
        user_telephone,
        user_pays,
        user_ville,
        'actif'
    ) RETURNING id INTO new_user_id;
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour changer le mot de passe utilisateur
CREATE OR REPLACE FUNCTION change_user_password(
    user_id UUID,
    old_password TEXT,
    new_password TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    current_hash TEXT;
BEGIN
    -- Récupérer le hash actuel
    SELECT password_hash INTO current_hash
    FROM users
    WHERE id = user_id;
    
    -- Vérifier l'ancien mot de passe
    IF NOT verify_password(old_password, current_hash) THEN
        RETURN FALSE;
    END IF;
    
    -- Mettre à jour avec le nouveau mot de passe
    UPDATE users
    SET password_hash = hash_password(new_password),
        updated_at = NOW()
    WHERE id = user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour réinitialiser le mot de passe (admin uniquement)
CREATE OR REPLACE FUNCTION reset_user_password(
    user_email TEXT,
    new_password TEXT,
    admin_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    admin_role TEXT;
BEGIN
    -- Vérifier que l'admin a les permissions
    SELECT role INTO admin_role
    FROM admins
    WHERE id = admin_id AND actif = TRUE;
    
    IF admin_role NOT IN ('super_admin', 'admin') THEN
        RETURN FALSE;
    END IF;
    
    -- Réinitialiser le mot de passe
    UPDATE users
    SET password_hash = hash_password(new_password),
        updated_at = NOW()
    WHERE email = user_email;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Vue pour les sessions utilisateur (sans mot de passe)
CREATE VIEW v_user_sessions AS
SELECT 
    id,
    email,
    nom,
    prenom,
    nom_complet,
    telephone,
    pays,
    ville,
    niveau_donateur,
    total_dons,
    nombre_enfants_parraines,
    statut,
    created_at
FROM users
WHERE statut = 'actif';

-- Vue pour les sessions admin (sans mot de passe)
CREATE VIEW v_admin_sessions AS
SELECT 
    id,
    email,
    nom,
    prenom,
    role,
    permissions,
    derniere_connexion,
    created_at
FROM admins
WHERE actif = TRUE;