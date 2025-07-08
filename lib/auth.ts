import { executeQuery } from './database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'paiecash-secret-key-2024';

export interface Admin {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  actif: boolean;
}

export async function authenticateAdmin(email: string, password: string): Promise<{ success: boolean; admin?: Admin; token?: string; error?: string }> {
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

    // Créer le token JWT
    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email, 
        role: admin.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Mettre à jour la dernière connexion
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

export function verifyToken(token: string): { valid: boolean; admin?: any } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, admin: decoded };
  } catch (error) {
    return { valid: false };
  }
}

export function verifyAuth(request: NextRequest): { valid: boolean; admin?: any } {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return { valid: false };
  }

  return verifyToken(token);
}