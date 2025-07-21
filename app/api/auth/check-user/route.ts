import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database-cloudsql';

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'ID Keycloak depuis les paramètres de requête
    const { searchParams } = new URL(request.url);
    const keycloakId = searchParams.get('keycloakId');

    if (!keycloakId) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID Keycloak requis' 
      }, { status: 400 });
    }

    // Vérifier si l'utilisateur existe déjà dans la base de données
    const result = await executeQuery(
      'SELECT id FROM user_profiles WHERE keycloak_id = ?',
      [keycloakId]
    );

    const exists = result.success && result.data && (result.data as any[]).length > 0;

    return NextResponse.json({ 
      success: true, 
      exists,
      profileId: exists ? (result.data as any[])[0].id : null
    });
  } catch (error) {
    console.error('Erreur vérification utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}