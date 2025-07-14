import { executeQuery, executeInsert } from '@/lib/database-cloudsql';

export interface Enfant {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  sexe: string;
  position: string;
  photo_emoji: string;
  photo_url?: string;
  club_id: string;
  pays_id: string;
  federation_id: string;
  has_license: boolean;
  statut: string;
  biographie?: string;
  reves_objectifs?: string;
  // Relations
  club_nom?: string;
  pays_nom?: string;
  flag_emoji?: string;
  federation_nom?: string;
  nombre_parrains?: number;
  total_dons_recus?: number;
}

// Récupérer tous les enfants actifs
export async function getActiveChildren(): Promise<Enfant[]> {
  const result = await executeQuery<any[]>(
    'SELECT * FROM v_enfants_complets WHERE statut = "actif" ORDER BY nom, prenom'
  );

  return result.success && result.data ? result.data : [];
}

// Récupérer les enfants sans licence
export async function getChildrenWithoutLicense(): Promise<Enfant[]> {
  const result = await executeQuery<any[]>(
    'SELECT * FROM v_enfants_complets WHERE has_license = FALSE AND statut = "actif" ORDER BY nom, prenom'
  );

  return result.success && result.data ? result.data : [];
}

// Récupérer un enfant par ID
export async function getChildById(id: string): Promise<Enfant | null> {
  const result = await executeQuery<any[]>(
    'SELECT * FROM v_enfants_complets WHERE id = ?',
    [id]
  );

  return result.success && result.data && result.data.length > 0 ? result.data[0] : null;
}

// Créer un nouvel enfant
export async function createChild(childData: {
  nom: string;
  prenom: string;
  age: number;
  sexe: string;
  position: string;
  photo_emoji: string;
  club_id: string;
  pays_id: string;
  federation_id: string;
  biographie?: string;
  reves_objectifs?: string;
}): Promise<string | null> {
  const result = await executeInsert(
    `INSERT INTO enfants (
      nom, prenom, age, sexe, position, photo_emoji, 
      club_id, pays_id, federation_id, biographie, reves_objectifs, statut
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'actif')`,
    [
      childData.nom,
      childData.prenom,
      childData.age,
      childData.sexe,
      childData.position,
      childData.photo_emoji,
      childData.club_id,
      childData.pays_id,
      childData.federation_id,
      childData.biographie || null,
      childData.reves_objectifs || null
    ]
  );

  return result.success ? result.insertId || null : null;
}

// Mettre à jour le statut de licence d'un enfant
export async function updateChildLicenseStatus(childId: string, hasLicense: boolean): Promise<boolean> {
  const result = await executeQuery(
    'UPDATE enfants SET has_license = ? WHERE id = ?',
    [hasLicense, childId]
  );

  return result.success;
}

// Rechercher des enfants
export async function searchChildren(searchTerm: string): Promise<Enfant[]> {
  const result = await executeQuery<any[]>(
    `SELECT * FROM v_enfants_complets 
     WHERE (nom LIKE ? OR prenom LIKE ? OR club_nom LIKE ? OR pays_nom LIKE ?) 
     AND statut = 'actif'
     ORDER BY nom, prenom`,
    [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
  );

  return result.success && result.data ? result.data : [];
}

// Récupérer les enfants par pays
export async function getChildrenByCountry(paysId: string): Promise<Enfant[]> {
  const result = await executeQuery<any[]>(
    'SELECT * FROM v_enfants_complets WHERE pays_id = ? AND statut = "actif" ORDER BY nom, prenom',
    [paysId]
  );

  return result.success && result.data ? result.data : [];
}

// Récupérer les enfants par club
export async function getChildrenByClub(clubId: string): Promise<Enfant[]> {
  const result = await executeQuery<any[]>(
    'SELECT * FROM v_enfants_complets WHERE club_id = ? AND statut = "actif" ORDER BY nom, prenom',
    [clubId]
  );

  return result.success && result.data ? result.data : [];
}

// Récupérer les statistiques des enfants
export async function getChildrenStats() {
  const result = await executeQuery<any[]>(
    `SELECT 
      COUNT(*) as total_enfants,
      COUNT(CASE WHEN has_license = TRUE THEN 1 END) as avec_licence,
      COUNT(CASE WHEN has_license = FALSE THEN 1 END) as sans_licence,
      COUNT(CASE WHEN sexe = 'M' THEN 1 END) as garcons,
      COUNT(CASE WHEN sexe = 'F' THEN 1 END) as filles,
      AVG(age) as age_moyen
     FROM enfants 
     WHERE statut = 'actif'`
  );

  return result.success && result.data ? result.data[0] : null;
}