import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET() {
  try {
    const result = await executeQuery(`
      SELECT 
        z.nom as zone_nom,
        f.id,
        f.nom,
        f.nom_complet,
        p.nom as pays_nom,
        p.flag_emoji,
        p.langues,
        (SELECT COUNT(*) FROM clubs c WHERE c.federation_id = f.id AND c.statut = 'actif') as clubs_count,
        (SELECT COUNT(*) FROM enfants e WHERE e.federation_id = f.id AND e.statut = 'actif') as enfants_count
      FROM federations f
      JOIN pays p ON f.pays_id = p.id
      JOIN zones_caf z ON p.zone_caf_id = z.id
      ORDER BY z.nom, p.nom
    `);

    if (!result.success || !result.data) {
      return NextResponse.json({ success: false, error: 'Erreur de récupération' });
    }

    // Grouper par zones
    const zonesMap = new Map();
    
    result.data.forEach((row: any) => {
      if (!zonesMap.has(row.zone_nom)) {
        zonesMap.set(row.zone_nom, {
          nom: row.zone_nom,
          federations: []
        });
      }
      
      zonesMap.get(row.zone_nom).federations.push({
        id: row.id,
        nom: row.nom,
        nom_complet: row.nom_complet,
        pays_nom: row.pays_nom,
        flag_emoji: row.flag_emoji,
        langues: row.langues ? JSON.parse(row.langues) : [],
        clubs_count: row.clubs_count,
        enfants_count: row.enfants_count
      });
    });

    const zones = Array.from(zonesMap.values());

    return NextResponse.json({ 
      success: true, 
      data: zones 
    });
  } catch (error) {
    console.error('Erreur récupération fédérations:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}