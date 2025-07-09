import { executeQuery } from './database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'paiecash-secret-key-2024';

export interface Admin {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  actif: boolean;
}

export interface DecodedAdminPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Authentifier un admin et générer un token
export async function authenticateAdmin(
  email: string,
  password: string
): Promise<{
  success: boolean;
  admin?: Admin;
  token?: string;
  error?: string;
}> {
  try {
    const result = await executeQuery<Admin[]>(
      'SELECT id, email, password_hash, nom, prenom, role, actif FROM admins WHERE email = ? AND actif = TRUE',
      [email]
    );

    if (!result.success || !result.data || result.data.length === 0) {
      return { success: false, error: 'Email ou mot de passe incorrect' };
    }

    const admin = result.data[0] as any;
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      return { success: false, error: 'Email ou mot de passe incorrect' };
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    await executeQuery(
      'UPDATE admins SET derniere_connexion = NOW() WHERE id = ?',
      [admin.id]
    );

    return {
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        nom: admin.nom,
        prenom: admin.prenom,
        role: admin.role,
        actif: admin.actif
      },
      token
    };
  } catch (error: any) {
    return { success: false, error: 'Erreur de connexion' };
  }
}

// Vérifie et décode un token
export function verifyToken(token: string): { valid: boolean; admin?: DecodedAdminPayload } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedAdminPayload;
    return { valid: true, admin: decoded };
  } catch {
    return { valid: false };
  }
}

// Pour middleware : vérifie le token et lève une erreur si invalide
export function verifyAuth(token: string): Promise<DecodedAdminPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err || !decoded) {
        reject(new Error('Token invalide'));
      } else {
        resolve(decoded as DecodedAdminPayload);
      }
    });
  });
}
