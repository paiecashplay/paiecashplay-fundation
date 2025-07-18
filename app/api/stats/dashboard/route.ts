import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database-cloudsql';

export async function GET() {
  try {
    const result = await executeQuery(`
      SELECT 
        (SELECT COUNT(*) FROM enfants WHERE statut = 'actif') as enfants_actifs,
        (SELECT COUNT(*) FROM clubs WHERE statut = 'actif') as clubs_actifs,
        (SELECT COUNT(*) FROM user_profiles) as donateurs_actifs,
        (SELECT COALESCE(SUM(montant), 0) FROM donations WHERE statut = 'complete') as total_dons,
        (SELECT COUNT(*) FROM licences WHERE statut = 'active') as licences_actives,
        (SELECT COUNT(*) FROM parrainages WHERE statut = 'actif') as parrainages_actifs
    `);

    return NextResponse.json({ 
      success: true, 
      data: result.data?.[0] || {} 
    });
  } catch (error) {
    console.error('Erreur récupération stats dashboard:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}