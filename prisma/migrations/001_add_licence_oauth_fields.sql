-- Migration pour ajouter les champs OAuth aux licences
-- Cette migration met à jour le modèle Licence pour stocker uniquement les IDs OAuth

-- Modifier la table licences pour utiliser les IDs OAuth
ALTER TABLE licences 
MODIFY COLUMN joueur_oauth_id VARCHAR(191) NOT NULL COMMENT 'ID OAuth du joueur depuis le système d\'authentification',
MODIFY COLUMN club_oauth_id VARCHAR(191) NOT NULL COMMENT 'ID OAuth du club depuis le système d\'authentification';

-- Ajouter des index pour améliorer les performances
CREATE INDEX idx_licences_joueur_oauth ON licences(joueur_oauth_id);
CREATE INDEX idx_licences_club_oauth ON licences(club_oauth_id);
CREATE INDEX idx_licences_pack_donation ON licences(pack_donation_id);
CREATE INDEX idx_licences_statut ON licences(statut);
CREATE INDEX idx_licences_date_expiration ON licences(date_expiration);