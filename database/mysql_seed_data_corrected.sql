-- Données de test corrigées pour PaieCashPlay Fondation
-- Compatible avec la structure mysql_install.sql

SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';
SET FOREIGN_KEY_CHECKS = 0;

-- 1. ZONES CAF
INSERT INTO zones_caf (id, nom, code, description) VALUES
('zone-wafu-a-001', 'ZONE OUEST A (WAFU A)', 'WAFU_A', 'Zone Ouest A de la Confédération Africaine de Football'),
('zone-wafu-b-002', 'ZONE OUEST B (WAFU B)', 'WAFU_B', 'Zone Ouest B de la Confédération Africaine de Football'),
('zone-uniffac-003', 'ZONE CENTRALE (UNIFFAC)', 'UNIFFAC', 'Union des Fédérations de Football d''Afrique Centrale'),
('zone-cecafa-004', 'ZONE EST (CECAFA)', 'CECAFA', 'Conseil des Associations de Football d''Afrique de l''Est et Centrale'),
('zone-cosafa-005', 'ZONE AUSTRALE (COSAFA)', 'COSAFA', 'Conseil des Associations de Football d''Afrique Australe'),
('zone-unaf-006', 'ZONE NORD (UNAF)', 'UNAF', 'Union Nord-Africaine de Football');

-- 2. PAYS (sélection représentative)
INSERT INTO pays (id, nom, code_iso, flag_emoji, langues, zone_caf_id) VALUES
('pays-sen-001', 'SÉNÉGAL', 'SEN', '🇸🇳', JSON_ARRAY('FR', 'WO'), 'zone-wafu-a-001'),
('pays-mar-002', 'MAROC', 'MAR', '🇲🇦', JSON_ARRAY('AR', 'FR'), 'zone-wafu-a-001'),
('pays-nga-003', 'NIGÉRIA', 'NGA', '🇳🇬', JSON_ARRAY('EN', 'HA'), 'zone-wafu-b-002'),
('pays-gha-004', 'GHANA', 'GHA', '🇬🇭', JSON_ARRAY('EN', 'AK'), 'zone-wafu-b-002'),
('pays-civ-005', 'CÔTE D''IVOIRE', 'CIV', '🇨🇮', JSON_ARRAY('FR', 'DY'), 'zone-wafu-b-002'),
('pays-cmr-006', 'CAMEROUN', 'CMR', '🇨🇲', JSON_ARRAY('FR', 'EN'), 'zone-uniffac-003'),
('pays-cod-007', 'RD CONGO', 'COD', '🇨🇩', JSON_ARRAY('FR', 'LN'), 'zone-uniffac-003'),
('pays-ken-008', 'KENYA', 'KEN', '🇰🇪', JSON_ARRAY('EN', 'SW'), 'zone-cecafa-004'),
('pays-zaf-009', 'AFRIQUE DU SUD', 'ZAF', '🇿🇦', JSON_ARRAY('EN', 'AF'), 'zone-cosafa-005'),
('pays-egy-010', 'ÉGYPTE', 'EGY', '🇪🇬', JSON_ARRAY('AR', 'EN'), 'zone-unaf-006');

-- 3. FEDERATIONS
INSERT INTO federations (id, nom, nom_complet, pays_id, site_web, email, president) VALUES
('fed-fsf-001', 'FSF', 'Fédération Sénégalaise de Football', 'pays-sen-001', 'www.fsf.sn', 'contact@fsf.sn', 'Augustin Senghor'),
('fed-frmf-002', 'FRMF', 'Fédération Royale Marocaine de Football', 'pays-mar-002', 'www.frmf.ma', 'contact@frmf.ma', 'Fouzi Lekjaa'),
('fed-nff-003', 'NFF', 'Nigeria Football Federation', 'pays-nga-003', 'www.nff.gov.ng', 'info@nff.gov.ng', 'Ibrahim Gusau'),
('fed-gfa-004', 'GFA', 'Ghana Football Association', 'pays-gha-004', 'www.ghanafa.org', 'info@ghanafa.org', 'Kurt Okraku'),
('fed-fif-005', 'FIF', 'Fédération Ivoirienne de Football', 'pays-civ-005', 'www.fif.ci', 'contact@fif.ci', 'Yacine Idriss Diallo'),
('fed-fecafoot-006', 'FECAFOOT', 'Fédération Camerounaise de Football', 'pays-cmr-006', 'www.fecafoot.com', 'info@fecafoot.com', 'Samuel Eto''o'),
('fed-fecofa-007', 'FECOFA', 'Fédération Congolaise de Football-Association', 'pays-cod-007', 'www.fecofa.cd', 'contact@fecofa.cd', 'Liboyo Omari'),
('fed-fkf-008', 'FKF', 'Football Kenya Federation', 'pays-ken-008', 'www.footballkenya.org', 'info@fkf.co.ke', 'Nick Mwendwa'),
('fed-safa-009', 'SAFA', 'South African Football Association', 'pays-zaf-009', 'www.safa.net', 'info@safa.net', 'Danny Jordaan'),
('fed-efa-010', 'EFA', 'Egyptian Football Association', 'pays-egy-010', 'www.efa.com.eg', 'info@efa.com.eg', 'Ahmed Megahed');

-- 4. TYPES DE LICENCES
INSERT INTO types_licences (id, nom, code, description, prix, devise, duree_mois, couleur_badge, avantages) VALUES
('type-standard-001', 'Licence Standard', 'STANDARD', 'Licence officielle fédération avec tous les droits FIFA', 40.00, 'EUR', 12, '#3B82F6', 
 JSON_ARRAY('Licence officielle', 'Protection FIFA', 'Assurance')),
('type-solidaire-002', 'Licence Solidaire', 'SOLIDAIRE', 'Licence standard + don automatique 10€', 50.00, 'EUR', 12, '#4FBA73',
 JSON_ARRAY('Licence standard', 'Don automatique', 'Badge solidaire')),
('type-academie-003', 'Licence Académie', 'ACADEMIE', 'Pour académies indépendantes', 30.00, 'EUR', 12, '#8B5CF6',
 JSON_ARRAY('Académies indépendantes', 'Certification PaieCashPlay')),
('type-ambassadeur-004', 'Licence Ambassadeur', 'AMBASSADEUR', 'Pour joueurs influents', 75.00, 'EUR', 12, '#F59E0B',
 JSON_ARRAY('Joueurs influents', 'Privilèges spéciaux'));

-- 5. PACKS DE DONATION
INSERT INTO packs_donation (id, nom, code, description, prix, devise, type_recurrence, icone_fa, couleur_icone, couleur_fond, couleur_bouton, avantages, ordre_affichage) VALUES
('pack-license-001', 'License Solidaire', 'licenseDream', 'Inscription saison sportive officielle', 50.00, 'EUR', 'mensuel', 'faIdCard', '#10B981', '#DCFCE7', '#10B981',
 JSON_ARRAY('Nom et photo enfant', 'Mises à jour progrès', 'Certificat parrainage'), 1),
('pack-equipment-002', 'Champion Equipment', 'championEquipment', 'Kit complet équipement', 100.00, 'EUR', 'unique', 'faTshirt', '#EA580C', '#FED7AA', '#EA580C',
 JSON_ARRAY('Photo équipement', 'Vidéo remerciement', 'Mur des héros'), 2),
('pack-energy-003', 'Daily Energy', 'dailyEnergy', 'Repas équilibrés et collations', 10.00, 'EUR', 'mensuel', 'faAppleAlt', '#10B981', '#DCFCE7', '#10B981',
 JSON_ARRAY('Rapports impact', 'Suivi nutrition', 'Amélioration santé'), 3);

-- 6. CLUBS
INSERT INTO clubs (id, nom, ville, federation_id, pays_id, email, president, entraineur, statut) VALUES
('club-jaraaf-001', 'ASC Jaraaf', 'Dakar', 'fed-fsf-001', 'pays-sen-001', 'contact@jaraaf.sn', 'Seydou Sané', 'Malick Daff', 'actif'),
('club-raja-002', 'Raja Casablanca', 'Casablanca', 'fed-frmf-002', 'pays-mar-002', 'info@rajacasablanca.com', 'Mohamed Boudrika', 'Patrice Carteron', 'actif'),
('club-kano-003', 'Kano Pillars', 'Kano', 'fed-nff-003', 'pays-nga-003', 'info@kanopillars.ng', 'Surajo Shaaibu', 'Abdul Maikaba', 'actif'),
('club-hearts-004', 'Hearts of Oak', 'Accra', 'fed-gfa-004', 'pays-gha-004', 'info@heartsofoak.com', 'Togbe Afede XIV', 'Samuel Boadu', 'actif'),
('club-asec-005', 'ASEC Mimosas', 'Abidjan', 'fed-fif-005', 'pays-civ-005', 'contact@asecmimosas.ci', 'Jean-Marc Guillou', 'Julien Chevalier', 'actif'),
('club-canon-006', 'Canon Yaoundé', 'Yaoundé', 'fed-fecafoot-006', 'pays-cmr-006', 'info@canonyaounde.cm', 'Dieudonné Happi', 'Martin Ndtoungou', 'actif'),
('club-mazembe-007', 'TP Mazembe', 'Lubumbashi', 'fed-fecofa-007', 'pays-cod-007', 'contact@tpmazembe.com', 'Moïse Katumbi', 'Pamphile Mihayo', 'actif'),
('club-gor-008', 'Gor Mahia', 'Nairobi', 'fed-fkf-008', 'pays-ken-008', 'info@gormahia.co.ke', 'Ambrose Rachier', 'Jonathan McKinstry', 'actif'),
('club-kaizer-009', 'Kaizer Chiefs', 'Johannesburg', 'fed-safa-009', 'pays-zaf-009', 'info@kaizerchiefs.com', 'Kaizer Motaung', 'Arthur Zwane', 'actif'),
('club-ahly-010', 'Al Ahly', 'Le Caire', 'fed-efa-010', 'pays-egy-010', 'info@alahly.com', 'Mahmoud El Khatib', 'Marcel Koller', 'actif');

-- 7. USERS
INSERT INTO users (id, email, password_hash, nom, prenom, pays, ville, niveau_donateur, total_dons, statut) VALUES
('user-test-001', 'test@paiecash.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVLvxgfUy', 'Test', 'User', 'France', 'Paris', 'Bronze', 75.00, 'actif'),
('user-pierre-002', 'pierre.ferracci@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVLvxgfUy', 'Ferracci', 'Pierre', 'France', 'Lyon', 'Platine', 2500.00, 'actif'),
('user-sarah-003', 'sarah.martin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVLvxgfUy', 'Martin', 'Sarah', 'France', 'Marseille', 'Or', 1800.00, 'actif'),
('user-mike-004', 'mike.robert@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVLvxgfUy', 'Robert', 'Mike', 'Canada', 'Toronto', 'Argent', 950.00, 'actif'),
('user-anna-005', 'anna.klein@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVLvxgfUy', 'Klein', 'Anna', 'Allemagne', 'Berlin', 'Bronze', 420.00, 'actif');

-- 8. ENFANTS
INSERT INTO enfants (id, nom, prenom, age, date_naissance, sexe, position, photo_emoji, club_id, pays_id, federation_id, has_license, statut, biographie) VALUES
('enfant-mamadou-001', 'Diallo', 'Mamadou', 12, '2012-03-15', 'M', 'Attaquant', '👦🏿', 'club-jaraaf-001', 'pays-sen-001', 'fed-fsf-001', FALSE, 'actif', 'Jeune talent prometteur du football sénégalais'),
('enfant-fatou-002', 'Sall', 'Fatou', 10, '2014-07-22', 'F', 'Milieu', '👧🏿', 'club-jaraaf-001', 'pays-sen-001', 'fed-fsf-001', FALSE, 'actif', 'Passionnée de football depuis son plus jeune âge'),
('enfant-youssef-003', 'Benali', 'Youssef', 14, '2010-11-08', 'M', 'Défenseur', '👦🏾', 'club-raja-002', 'pays-mar-002', 'fed-frmf-002', FALSE, 'actif', 'Défenseur solide avec excellente vision du jeu'),
('enfant-kemi-004', 'Adebayo', 'Kemi', 11, '2013-05-30', 'F', 'Gardien', '👧🏿', 'club-kano-003', 'pays-nga-003', 'fed-nff-003', FALSE, 'actif', 'Gardienne talentueuse avec un grand avenir'),
('enfant-kwame-005', 'Asante', 'Kwame', 13, '2011-09-12', 'M', 'Milieu', '👦🏿', 'club-hearts-004', 'pays-gha-004', 'fed-gfa-004', FALSE, 'actif', 'Milieu de terrain créatif et technique'),
('enfant-amina-006', 'Kone', 'Amina', 12, '2012-01-18', 'F', 'Attaquant', '👧🏿', 'club-asec-005', 'pays-civ-005', 'fed-fif-005', FALSE, 'actif', 'Attaquante rapide et technique'),
('enfant-thabo-007', 'Mbeki', 'Thabo', 15, '2009-04-25', 'M', 'Milieu', '👦🏿', 'club-kaizer-009', 'pays-zaf-009', 'fed-safa-009', FALSE, 'actif', 'Capitaine de son équipe junior'),
('enfant-fatima-008', 'Hassan', 'Fatima', 13, '2011-12-03', 'F', 'Défenseur', '👧🏾', 'club-ahly-010', 'pays-egy-010', 'fed-efa-010', FALSE, 'actif', 'Défenseure centrale prometteuse');

-- 9. LICENCES
INSERT INTO licences (id, numero_licence, enfant_id, type_licence_id, club_id, federation_id, date_emission, date_expiration, statut, montant_paye, devise) VALUES
('licence-001', 'SEN-FSF-2024-001', 'enfant-mamadou-001', 'type-standard-001', 'club-jaraaf-001', 'fed-fsf-001', '2024-01-15', '2025-01-15', 'active', 40.00, 'EUR'),
('licence-002', 'MAR-FRMF-2024-002', 'enfant-youssef-003', 'type-solidaire-002', 'club-raja-002', 'fed-frmf-002', '2024-02-01', '2025-02-01', 'active', 50.00, 'EUR'),
('licence-003', 'GHA-GFA-2024-003', 'enfant-kwame-005', 'type-standard-001', 'club-hearts-004', 'fed-gfa-004', '2024-01-20', '2025-01-20', 'active', 40.00, 'EUR');

-- 10. DONATIONS
INSERT INTO donations (id, user_id, enfant_id, pack_donation_id, montant, devise, type_don, statut, methode_paiement, date_paiement) VALUES
('donation-001', 'user-test-001', 'enfant-mamadou-001', 'pack-license-001', 50.00, 'EUR', 'unique', 'complete', 'stripe', NOW()),
('donation-002', 'user-pierre-002', 'enfant-fatou-002', 'pack-equipment-002', 100.00, 'EUR', 'unique', 'complete', 'stripe', DATE_SUB(NOW(), INTERVAL 2 WEEK)),
('donation-003', 'user-sarah-003', 'enfant-youssef-003', 'pack-energy-003', 10.00, 'EUR', 'mensuel', 'complete', 'stripe', DATE_SUB(NOW(), INTERVAL 1 MONTH)),
('donation-004', 'user-mike-004', NULL, 'pack-license-001', 25.00, 'EUR', 'unique', 'complete', 'paypal', DATE_SUB(NOW(), INTERVAL 3 DAY));

-- 11. PARRAINAGES
INSERT INTO parrainages (id, user_id, enfant_id, pack_donation_id, date_debut, statut, montant_mensuel, devise, message_parrain) VALUES
('parrainage-001', 'user-pierre-002', 'enfant-mamadou-001', 'pack-license-001', '2024-01-01', 'actif', 50.00, 'EUR', 'Je suis fier de soutenir Mamadou dans sa passion pour le football'),
('parrainage-002', 'user-test-001', 'enfant-fatou-002', 'pack-license-001', '2024-02-01', 'actif', 50.00, 'EUR', 'Bonne chance Fatou pour tes rêves footballistiques!');

-- 12. ADMINS (mot de passe: Admin123!)
INSERT INTO admins (id, email, password_hash, nom, prenom, role, permissions, actif) VALUES
('admin-001', 'admin@paiecash.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'Super', 'super_admin', 
 JSON_ARRAY('all_permissions', 'manage_users', 'manage_federations', 'manage_licenses', 'view_statistics'), TRUE);

-- 13. CONTACTS
INSERT INTO contacts (id, nom, email, telephone, source, sujet, message, statut) VALUES
('contact-001', 'Dupont', 'jean.dupont@example.com', '+33123456789', 'Site web', 'Information parrainage', 'Je souhaite des informations sur le parrainage d enfants', 'nouveau'),
('contact-002', 'Smith', 'mary.smith@example.com', '+44987654321', 'Réseaux sociaux', 'Collaboration', 'Notre entreprise souhaite devenir partenaire', 'nouveau');

-- 14. NEWSLETTERS
INSERT INTO newsletters (id, email, nom, statut, source) VALUES
('newsletter-001', 'newsletter1@example.com', 'Jean Martin', 'actif', 'Site web'),
('newsletter-002', 'newsletter2@example.com', 'Marie Dubois', 'actif', 'Réseaux sociaux'),
('newsletter-003', 'newsletter3@example.com', 'Paul Durand', 'actif', 'Bouche à oreille');

-- 15. STATISTIQUES IMPACT
INSERT INTO statistiques_impact (
    id, date_mesure, enfants_soutenus, clubs_affilies, total_dons_collectes, 
    donateurs_actifs, licences_emises, equipements_distribues, 
    repas_fournis, formations_dispensees
) VALUES 
('stats-001', CURDATE(), 8, 10, 2100.00, 5, 3, 12, 450, 8);

SET FOREIGN_KEY_CHECKS = 1;

-- Vérification
SELECT 'Installation des données terminée!' as message;
SELECT 
    (SELECT COUNT(*) FROM zones_caf) as zones,
    (SELECT COUNT(*) FROM pays) as pays,
    (SELECT COUNT(*) FROM federations) as federations,
    (SELECT COUNT(*) FROM clubs) as clubs,
    (SELECT COUNT(*) FROM enfants) as enfants,
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM donations) as donations;