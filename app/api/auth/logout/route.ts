import { NextRequest, NextResponse } from 'next/server';
import { keycloakUrls } from '@/lib/keycloak';

export async function POST(request: NextRequest) {
  try {
    // Créer une réponse
    const response = NextResponse.json({ 
      success: true,
      redirectUrl: keycloakUrls.logout
    });

    // Supprimer les cookies d'authentification
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');

    return response;
  } catch (error) {
    console.error('Erreur de déconnexion:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}