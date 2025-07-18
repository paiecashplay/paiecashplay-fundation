import { NextRequest, NextResponse } from 'next/server';
import { keycloakUrls } from '@/lib/keycloak';

export async function POST(request: NextRequest) {
  try {
    // Redirection vers la page de déconnexion Keycloak
    return NextResponse.json({ 
      success: true,
      redirectUrl: keycloakUrls.logout
    });
  } catch (error) {
    console.error('Erreur de déconnexion:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}