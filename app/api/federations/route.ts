import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database-cloudsql';

export async function GET() {
  try {
    const result = await executeQuery(`
      SELECT 
        f.id,
        f.nom,
        f.nom_complet,
        p.nom as pays_nom,
        p.flag_emoji
      FROM federations f
      JOIN pays p ON f.pays_id = p.id
      ORDER BY p.nom, f.nom
    `);

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur récupération fédérations' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: result.data 
    });
  } catch (error) {
    console.error('Erreur récupération fédérations:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}