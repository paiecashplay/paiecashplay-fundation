import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database-cloudsql';

export async function GET(request: NextRequest) {
  try {
    // Dans un environnement réel, vous récupéreriez l'ID Keycloak depuis le token
    // Pour l'exemple, nous simulons qu'aucun utilisateur n'est connecté
    
    // Simuler qu'aucun utilisateur n'est connecté par défaut
    const keycloakId = null;
    
    // Si aucun utilisateur n'est connecté, retourner directement une réponse 401
    if (!keycloakId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Non authentifié' 
      }, { status: 401 });
    }
    
    // Récupérer le profil utilisateur
    const result = await executeQuery(`
      SELECT 
        up.*,
        fp.federation_code,
        fp.president_name as federation_president,
        cp.club_code,
        cp.president_name as club_president,
        pp.player_number,
        pp.position
      FROM user_profiles up
      LEFT JOIN federation_profiles fp ON up.id = fp.user_profile_id
      LEFT JOIN club_profiles cp ON up.id = cp.user_profile_id
      LEFT JOIN player_profiles pp ON up.id = pp.user_profile_id
      WHERE up.keycloak_id = ?
    `, [keycloakId]);

    if (!result.success || !result.data || (result.data as any[]).length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      }, { status: 404 });
    }

    // Récupérer les rôles depuis Keycloak (simulé)
    const roles = ['user']; // Dans un environnement réel, récupérez les rôles depuis Keycloak
    
    const userData = (result.data as any[])[0];
    
    return NextResponse.json({ 
      success: true, 
      user: {
        ...userData,
        roles
      }
    });
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}