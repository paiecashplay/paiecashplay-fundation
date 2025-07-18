import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database-cloudsql';

export async function GET() {
  try {
    // Utilisation de la nouvelle structure de base de données avec Keycloak
    const result = await executeQuery(`
      SELECT 
        up.id,
        up.keycloak_id,
        COALESCE(SUM(d.montant), 0) as total_dons,
        CASE 
          WHEN COALESCE(SUM(d.montant), 0) > 1000 THEN 'Platine'
          WHEN COALESCE(SUM(d.montant), 0) > 500 THEN 'Or'
          WHEN COALESCE(SUM(d.montant), 0) > 100 THEN 'Argent'
          ELSE 'Bronze'
        END as niveau_donateur
      FROM user_profiles up
      LEFT JOIN donations d ON up.keycloak_id = d.keycloak_id AND d.statut = 'complete'
      GROUP BY up.id, up.keycloak_id
      HAVING total_dons > 0
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