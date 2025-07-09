import bcrypt from 'bcryptjs';
import { executeQuery, executeInsert } from '@/lib/database';

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  niveau_donateur: string;
  total_dons: number;
  statut: string;
}

export interface Admin {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  permissions: string[];
}

// Authentification utilisateur
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const result = await executeQuery<any[]>(
    'SELECT id, email, password_hash, nom, prenom, niveau_donateur, total_dons, statut FROM users WHERE email = ? AND statut = "actif"',
    [email]
  );

  if (!result.success || !result.data || result.data.length === 0) {
    return null;
  }

  const user = result.data[0];
  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    nom: user.nom,
    prenom: user.prenom,
    niveau_donateur: user.niveau_donateur,
    total_dons: user.total_dons,
    statut: user.statut
  };
}

// Authentification admin
export async function authenticateAdmin(email: string, password: string): Promise<Admin | null> {
  const result = await executeQuery<any[]>(
    'SELECT id, email, password_hash, nom, prenom, role, permissions FROM admins WHERE email = ? AND actif = TRUE',
    [email]
  );

  if (!result.success || !result.data || result.data.length === 0) {
    return null;
  }

  const admin = result.data[0];
  const isValidPassword = await bcrypt.compare(password, admin.password_hash);

  if (!isValidPassword) {
    return null;
  }

  // Mettre à jour la dernière connexion
  await executeQuery(
    'UPDATE admins SET derniere_connexion = NOW() WHERE id = ?',
    [admin.id]
  );

  return {
    id: admin.id,
    email: admin.email,
    nom: admin.nom,
    prenom: admin.prenom,
    role: admin.role,
    permissions: admin.permissions ? JSON.parse(admin.permissions) : []
  };
}

// Créer un utilisateur
export async function createUser(userData: {
  email: string;
  password: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
  pays?: string;
  ville?: string;
}): Promise<string | null> {
  const hashedPassword = await bcrypt.hash(userData.password, 12);

  const result = await executeInsert(
    `INSERT INTO users (email, password_hash, nom, prenom, telephone, pays, ville, statut) 
     VALUES (?, ?, ?, ?, ?, ?, ?, 'actif')`,
    [
      userData.email,
      hashedPassword,
      userData.nom || null,
      userData.prenom || null,
      userData.telephone || null,
      userData.pays || null,
      userData.ville || null
    ]
  );

  return result.success ? result.insertId || null : null;
}

// Changer mot de passe utilisateur
export async function changeUserPassword(
  userId: string, 
  oldPassword: string, 
  newPassword: string
): Promise<boolean> {
  // Vérifier l'ancien mot de passe
  const userResult = await executeQuery<any[]>(
    'SELECT password_hash FROM users WHERE id = ?',
    [userId]
  );

  if (!userResult.success || !userResult.data || userResult.data.length === 0) {
    return false;
  }

  const isValidOldPassword = await bcrypt.compare(oldPassword, userResult.data[0].password_hash);
  if (!isValidOldPassword) {
    return false;
  }

  // Mettre à jour avec le nouveau mot de passe
  const hashedNewPassword = await bcrypt.hash(newPassword, 12);
  const updateResult = await executeQuery(
    'UPDATE users SET password_hash = ? WHERE id = ?',
    [hashedNewPassword, userId]
  );

  return !!updateResult.success;
}

// Vérifier si un email existe
export async function emailExists(email: string, table: 'users' | 'admins' = 'users'): Promise<boolean> {
  const result = await executeQuery<any[]>(
    `SELECT id FROM ${table} WHERE email = ?`,
    [email]
  );

  return !!result.success && Array.isArray(result.data) && result.data.length > 0;
}
