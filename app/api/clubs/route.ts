import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database-cloudsql';

export async function GET() {
  try {
    const result = await executeQuery(`
      SELECT 
        c.id,
        c.nom,
        c.ville,
        f.nom as federation_nom,
        p.nom as pays_nom,
        p.flag_emoji
      FROM clubs c
      JOIN federations f ON c.federation_id = f.id
      JOIN pays p ON c.pays_id = p.id
      WHERE c.statut = 'actif'
      ORDER BY p.nom, c.nom
    `);

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur récupération clubs' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: result.data 
    });
  } catch (error) {
    console.error('Erreur récupération clubs:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}