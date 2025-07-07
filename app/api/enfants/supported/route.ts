import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET() {
  try {
    const result = await executeQuery(`
      SELECT 
        e.id,
        e.nom,
        e.prenom,
        e.age,
        e.photo_emoji,
        c.nom as club_nom,
        p.nom as pays_nom,
        COALESCE(SUM(d.montant), 0) as total_dons_recus,
        COUNT(DISTINCT par.id) as nombre_parrains
      FROM enfants e
      LEFT JOIN clubs c ON e.club_id = c.id
      LEFT JOIN pays p ON e.pays_id = p.id
      LEFT JOIN donations d ON e.id = d.enfant_id AND d.statut = 'complete'
      LEFT JOIN parrainages par ON e.id = par.enfant_id AND par.statut = 'actif'
      WHERE e.statut = 'actif'
      GROUP BY e.id, e.nom, e.prenom, e.age, e.photo_emoji, c.nom, p.nom
      HAVING total_dons_recus > 0 OR nombre_parrains > 0
      ORDER BY total_dons_recus DESC, nombre_parrains DESC
      LIMIT 10
    `);

    return NextResponse.json({ 
      success: true, 
      data: result.data || [] 
    });
  } catch (error) {
    console.error('Erreur récupération enfants soutenus:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}