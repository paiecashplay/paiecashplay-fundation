import { executeQuery, executeInsert, executeTransaction } from '@/lib/database';

export interface Donation {
  id: string;
  user_id: string;
  enfant_id?: string;
  pack_donation_id?: string;
  montant: number;
  devise: string;
  type_don: string;
  statut: string;
  methode_paiement?: string;
  stripe_session_id?: string;
  date_paiement?: Date;
  message_donateur?: string;
  anonyme: boolean;
}

export interface PackDonation {
  id: string;
  nom: string;
  code: string;
  description: string;
  prix: number;
  devise: string;
  type_recurrence: string;
  icone_fa: string;
  couleur_icone: string;
  couleur_fond: string;
  couleur_bouton: string;
  avantages: string[];
  actif: boolean;
  ordre_affichage: number;
}

// Récupérer tous les packs de donation actifs
export async function getActiveDonationPacks(): Promise<PackDonation[]> {
  const result = await executeQuery<any[]>(
    'SELECT * FROM packs_donation WHERE actif = TRUE ORDER BY ordre_affichage ASC'
  );

  if (!result.success || !result.data) {
    return [];
  }

  return result.data.map(pack => ({
    ...pack,
    avantages: pack.avantages ? JSON.parse(pack.avantages) : []
  }));
}

// Créer une nouvelle donation
export async function createDonation(donationData: {
  user_id: string;
  enfant_id?: string;
  pack_donation_id?: string;
  montant: number;
  devise?: string;
  type_don: string;
  methode_paiement?: string;
  stripe_session_id?: string;
  message_donateur?: string;
  anonyme?: boolean;
}): Promise<string | null> {
  const result = await executeInsert(
    `INSERT INTO donations (
      user_id, enfant_id, pack_donation_id, montant, devise, type_don, 
      methode_paiement, stripe_session_id, message_donateur, anonyme, statut
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'en_attente')`,
    [
      donationData.user_id,
      donationData.enfant_id || null,
      donationData.pack_donation_id || null,
      donationData.montant,
      donationData.devise || 'EUR',
      donationData.type_don,
      donationData.methode_paiement || null,
      donationData.stripe_session_id || null,
      donationData.message_donateur || null,
      donationData.anonyme || false
    ]
  );

  return result.success ? result.insertId || null : null;
}

// Mettre à jour le statut d'une donation
export async function updateDonationStatus(
  donationId: string, 
  statut: string, 
  stripePaymentIntentId?: string
): Promise<boolean> {
  const queries = [
    {
      query: 'UPDATE donations SET statut = ?, date_paiement = NOW(), stripe_payment_intent_id = ? WHERE id = ?',
      params: [statut, stripePaymentIntentId || null, donationId]
    }
  ];

  // Si la donation est complète, mettre à jour les statistiques utilisateur
  if (statut === 'complete') {
    queries.push({
      query: `UPDATE users u 
              SET total_dons = (
                SELECT COALESCE(SUM(montant), 0) 
                FROM donations d 
                WHERE d.user_id = u.id AND d.statut = 'complete'
              ),
              date_premier_don = COALESCE(u.date_premier_don, NOW())
              WHERE u.id = (SELECT user_id FROM donations WHERE id = ?)`,
      params: [donationId]
    });
  }

  const result = await executeTransaction(queries);
  return result.success;
}

// Récupérer les donations d'un utilisateur
export async function getUserDonations(userId: string): Promise<Donation[]> {
  const result = await executeQuery<any[]>(
    `SELECT d.*, pd.nom as pack_nom, e.nom as enfant_nom, e.prenom as enfant_prenom
     FROM donations d
     LEFT JOIN packs_donation pd ON d.pack_donation_id = pd.id
     LEFT JOIN enfants e ON d.enfant_id = e.id
     WHERE d.user_id = ?
     ORDER BY d.created_at DESC`,
    [userId]
  );

  return result.success && result.data ? result.data : [];
}

// Récupérer les statistiques de donations
export async function getDonationStats() {
  const result = await executeQuery<any[]>(
    `SELECT 
      COUNT(*) as total_donations,
      SUM(CASE WHEN statut = 'complete' THEN montant ELSE 0 END) as total_collecte,
      COUNT(DISTINCT user_id) as donateurs_uniques,
      AVG(CASE WHEN statut = 'complete' THEN montant ELSE NULL END) as don_moyen
     FROM donations`
  );

  return result.success && result.data ? result.data[0] : null;
}

// Récupérer une donation par session Stripe
export async function getDonationByStripeSession(sessionId: string): Promise<Donation | null> {
  const result = await executeQuery<any[]>(
    'SELECT * FROM donations WHERE stripe_session_id = ?',
    [sessionId]
  );

  return result.success && result.data && result.data.length > 0 ? result.data[0] : null;
}