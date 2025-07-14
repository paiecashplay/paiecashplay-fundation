import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database-cloudsql';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    // Corriger le mot de passe admin
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    
    const result = await executeQuery(
      'UPDATE admins SET password_hash = ? WHERE email = ?',
      [hashedPassword, 'admin@paiecash.com']
    );

    return NextResponse.json({ 
      message: 'Mot de passe admin corrigé', 
      success: result.success,
      newHash: hashedPassword
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erreur serveur', details: error.message });
  }
}

export async function GET() {
  try {
    // Vérifier si l'admin existe
    const result = await executeQuery(
      'SELECT id, email, password_hash, nom, prenom, actif FROM admins WHERE email = ?',
      ['admin@paiecash.com']
    );

    if (!result.success) {
      return NextResponse.json({ error: 'Erreur DB', details: result.error });
    }

    if (!result.data || (result.data as any[]).length === 0) {
      // Créer l'admin s'il n'existe pas
      const hashedPassword = await bcrypt.hash('Admin123!', 12);
      
      const insertResult = await executeQuery(
        'INSERT INTO admins (id, email, password_hash, nom, prenom, role, actif) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['admin-001', 'admin@paiecash.com', hashedPassword, 'Admin', 'Super', 'super_admin', true]
      );

      return NextResponse.json({ 
        message: 'Admin créé', 
        success: insertResult.success,
        error: insertResult.error 
      });
    }

    const admin = (result.data as any[])[0];
    
    // Tester le mot de passe
    const isValidPassword = await bcrypt.compare('Admin123!', admin.password_hash);

    return NextResponse.json({
      adminExists: true,
      email: admin.email,
      passwordValid: isValidPassword,
      actif: admin.actif
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Erreur serveur', details: error.message });
  }
}