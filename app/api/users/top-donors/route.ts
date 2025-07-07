import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET() {
  try {
    const result = await executeQuery(`
      SELECT 
        id,
        nom,
        prenom,
        niveau_donateur,
        total_dons
      FROM users 
      WHERE statut = 'actif' AND total_dons > 0
      ORDER BY total_dons DESC
      LIMIT 10
    `);

    return NextResponse.json({ 
      success: true, 
      data: result.data || [] 
    });
  } catch (error) {
    console.error('Erreur récupération top donateurs:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}