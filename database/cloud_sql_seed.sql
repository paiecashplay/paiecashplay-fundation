-- Données de base pour PaieCashPlay Fondation
-- Compatible avec Google Cloud SQL

SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';
SET FOREIGN_KEY_CHECKS = 0;

-- 1. PACKS DE DONATION
INSERT INTO packs_donation (id, nom, code, description, prix, devise, type_recurrence, icone_fa, couleur_icone, couleur_fond, couleur_bouton, avantages, ordre_affichage) VALUES
('pack-license-001', 'License Solidaire', 'licenseDream', 'Inscription saison sportive officielle', 50.00, 'EUR', 'mensuel', 'faIdCard', '#10B981', '#DCFCE7', '#10B981',
 JSON_ARRAY('Nom et photo enfant', 'Mises à jour progrès', 'Certificat parrainage'), 1),
('pack-equipment-002', 'Champion Equipment', 'championEquipment', 'Kit complet équipement', 100.00, 'EUR', 'unique', 'faTshirt', '#EA580C', '#FED7AA', '#EA580C',
 JSON_ARRAY('Photo équipement', 'Vidéo remerciement', 'Mur des héros'), 2),
('pack-energy-003', 'Daily Energy', 'dailyEnergy', 'Repas équilibrés et collations', 10.00, 'EUR', 'mensuel', 'faAppleAlt', '#10B981', '#DCFCE7', '#10B981',
 JSON_ARRAY('Rapports impact', 'Suivi nutrition', 'Amélioration santé'), 3);

-- 2. TYPES DE LICENCES
INSERT INTO types_licences (id, nom, code, description, prix, devise, duree_mois, couleur_badge, avantages) VALUES
('type-standard-001', 'Licence Standard', 'STANDARD', 'Licence officielle fédération avec tous les droits FIFA', 40.00, 'EUR', 12, '#3B82F6', 
 JSON_ARRAY('Licence officielle', 'Protection FIFA', 'Assurance')),
('type-solidaire-002', 'Licence Solidaire', 'SOLIDAIRE', 'Licence standard + don automatique 10€', 50.00, 'EUR', 12, '#4FBA73',
 JSON_ARRAY('Licence standard', 'Don automatique', 'Badge solidaire')),
('type-academie-003', 'Licence Académie', 'ACADEMIE', 'Pour académies indépendantes', 30.00, 'EUR', 12, '#8B5CF6',
 JSON_ARRAY('Académies indépendantes', 'Certification PaieCashPlay')),
('type-ambassadeur-004', 'Licence Ambassadeur', 'AMBASSADEUR', 'Pour joueurs influents', 75.00, 'EUR', 12, '#F59E0B',
 JSON_ARRAY('Joueurs influents', 'Privilèges spéciaux'));

-- 3. ADMINS (mot de passe: Admin123!)
INSERT INTO admins (id, email, password_hash, nom, prenom, role, permissions, actif) VALUES
('admin-001', 'admin@paiecash.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'Super', 'super_admin', 
 JSON_ARRAY('all_permissions', 'manage_users', 'manage_federations', 'manage_licenses', 'view_statistics'), TRUE);

-- 4. ZONES CAF (pour démo)
INSERT INTO zones_caf (id, nom, code, description) VALUES
('zone-wafu-a-001', 'ZONE OUEST A (WAFU A)', 'WAFU_A', 'Zone Ouest A de la Confédération Africaine de Football'),
('zone-wafu-b-002', 'ZONE OUEST B (WAFU B)', 'WAFU_B', 'Zone Ouest B de la Confédération Africaine de Football'),
('zone-unaf-006', 'ZONE NORD (UNAF)', 'UNAF', 'Union Nord-Africaine de Football');

-- 5. PAYS (exemples pour démo)
INSERT INTO pays (id, nom, code_iso, flag_emoji, langues, zone_caf_id) VALUES
('pays-sen-001', 'SÉNÉGAL', 'SEN', '🇸🇳', JSON_ARRAY('FR', 'WO'), 'zone-wafu-a-001'),
('pays-mar-002', 'MAROC', 'MAR', '🇲🇦', JSON_ARRAY('AR', 'FR'), 'zone-unaf-006'),
('pays-civ-005', 'CÔTE D''IVOIRE', 'CIV', '🇨🇮', JSON_ARRAY('FR', 'DY'), 'zone-wafu-b-002');

-- 6. FEDERATIONS (exemples pour démo)
INSERT INTO federations (id, nom, nom_complet, pays_id, site_web, email, president) VALUES
('fed-fsf-001', 'FSF', 'Fédération Sénégalaise de Football', 'pays-sen-001', 'www.fsf.sn', 'contact@fsf.sn', 'Augustin Senghor'),
('fed-frmf-002', 'FRMF', 'Fédération Royale Marocaine de Football', 'pays-mar-002', 'www.frmf.ma', 'contact@frmf.ma', 'Fouzi Lekjaa'),
('fed-fif-005', 'FIF', 'Fédération Ivoirienne de Football', 'pays-civ-005', 'www.fif.ci', 'contact@fif.ci', 'Yacine Idriss Diallo');

-- 7. CLUBS (exemples pour démo)
INSERT INTO clubs (id, nom, ville, federation_id, pays_id, email, president, entraineur, statut) VALUES
('club-jaraaf-001', 'ASC Jaraaf', 'Dakar', 'fed-fsf-001', 'pays-sen-001', 'contact@jaraaf.sn', 'Seydou Sané', 'Malick Daff', 'actif'),
('club-raja-002', 'Raja Casablanca', 'Casablanca', 'fed-frmf-002', 'pays-mar-002', 'info@rajacasablanca.com', 'Mohamed Boudrika', 'Patrice Carteron', 'actif'),
('club-asec-005', 'ASEC Mimosas', 'Abidjan', 'fed-fif-005', 'pays-civ-005', 'contact@asecmimosas.ci', 'Jean-Marc Guillou', 'Julien Chevalier', 'actif');

-- 8. PROFILS UTILISATEURS KEYCLOAK (exemples pour démo)
INSERT INTO user_profiles (id, keycloak_id, user_type, phone, address, bio) VALUES
('profile-user-001', 'keycloak-user-001', 'normal', '+33123456789', 'Paris, France', 'Passionné de football et de solidarité'),
('profile-fed-001', 'keycloak-fed-001', 'federation', '+221123456789', 'Dakar, Sénégal', 'Représentant officiel FSF'),
('profile-club-001', 'keycloak-club-001', 'club', '+221987654321', 'Dakar, Sénégal', 'Responsable ASC Jaraaf');

-- 9. PROFILS FÉDÉRATION (exemples pour démo)
INSERT INTO federation_profiles (id, user_profile_id, federation_code, president_name, website, official_email) VALUES
('fed-profile-001', 'profile-fed-001', 'FSF', 'Augustin Senghor', 'www.fsf.sn', 'contact@fsf.sn');

-- 10. PROFILS CLUB (exemples pour démo)
INSERT INTO club_profiles (id, user_profile_id, club_code, president_name, coach_name, federation_id) VALUES
('club-profile-001', 'profile-club-001', 'JARAAF', 'Seydou Sané', 'Malick Daff', 'fed-fsf-001');

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Installation des données terminée avec succès!' as message;