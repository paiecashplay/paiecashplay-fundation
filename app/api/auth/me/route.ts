import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database-cloudsql';

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token d'accès depuis le cookie
    const accessToken = request.cookies.get('access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'Non authentifié' 
      }, { status: 401 });
    }
    
    // Récupérer les informations utilisateur depuis Keycloak
    const userInfoEndpoint = `${process.env.KEYCLOAK_BASE_URL || 'https://auth.paiecashplay.com'}/realms/${process.env.KEYCLOAK_REALM || 'PaiecashPlay'}/protocol/openid-connect/userinfo`;
    
    let keycloakId = null;
    
    try {
      const userInfoResponse = await fetch(userInfoEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      if (!userInfoResponse.ok) {
        return NextResponse.json({ 
          success: false, 
          error: 'Token invalide' 
        }, { status: 401 });
      }
      
      const userInfo = await userInfoResponse.json();
      keycloakId = userInfo.sub; // L'ID unique de l'utilisateur dans Keycloak
    } catch (error) {
      console.error('Erreur récupération userinfo:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur récupération profil' 
      }, { status: 500 });
    }
    
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

    // Récupérer les rôles depuis les informations utilisateur Keycloak
    // Si l'utilisateur n'existe pas encore dans la base de données, créer un profil de base
    let roles = ['user']; // Rôle par défaut
    
    // Si l'utilisateur a un type de profil spécifique, ajouter le rôle correspondant
    if (userData.user_type) {
      switch (userData.user_type) {
        case 'federation':
          roles.push('federation');
          break;
        case 'club':
          roles.push('club');
          break;
        case 'player':
          roles.push('player');
          break;
        case 'admin':
          roles.push('admin');
          break;
      }
    }
    
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