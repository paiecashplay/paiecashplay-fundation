import { NextRequest, NextResponse } from 'next/server';
import { keycloakUrls } from '@/lib/keycloak';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { grant_type, refresh_token } = body;

    if (grant_type !== 'refresh_token' || !refresh_token) {
      return NextResponse.json(
        { error: 'Paramètres invalides' },
        { status: 400 }
      );
    }

    // Échanger le refresh token contre un nouveau token d'accès
    const tokenResponse = await fetch(keycloakUrls.token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.KEYCLOAK_CLIENT_ID || 'paiecashplay-fundation',
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET || '',
        refresh_token
      })
    });

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { error: 'Erreur rafraîchissement token' },
        { status: 401 }
      );
    }

    const tokenData = await tokenResponse.json();

    // Créer une réponse avec les nouveaux tokens
    const response = NextResponse.json({ success: true });

    // Stocker les tokens dans des cookies sécurisés
    response.cookies.set('access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in
    });

    response.cookies.set('refresh_token', tokenData.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 jours
    });

    return response;
  } catch (error) {
    console.error('Erreur rafraîchissement token:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}