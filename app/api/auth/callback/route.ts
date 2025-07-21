import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';

    const origin = `${forwardedProto}://${forwardedHost}`;

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // En cas d'erreur d'authentification
    if (error) {
      console.error('Erreur Keycloak:', error);
      return NextResponse.redirect(new URL('/auth?error=' + error, origin));
    }

    // Si pas de code, rediriger vers la page d'authentification
    if (!code) {
      return NextResponse.redirect(new URL('/auth', origin));
    }

    // Échanger le code contre un token
    const tokenEndpoint = `${process.env.KEYCLOAK_BASE_URL || 'https://auth.paiecashplay.com'}/realms/${process.env.KEYCLOAK_REALM || 'PaiecashPlay'}/protocol/openid-connect/token`;
    const redirectUri = `${origin}/api/auth/callback`;
    
    try {
      console.log('Échange du code contre un token avec les paramètres suivants:');
      console.log('- tokenEndpoint:', tokenEndpoint);
      console.log('- redirectUri:', redirectUri);
      console.log('- client_id:', process.env.KEYCLOAK_CLIENT_ID || 'paiecashplay-fundation');
      
      const tokenResponse = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.KEYCLOAK_CLIENT_ID || 'paiecashplay-fundation',
          client_secret: process.env.KEYCLOAK_CLIENT_SECRET || '',
          code,
          redirect_uri: redirectUri
        })
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Erreur échange code/token:', errorText);
        return NextResponse.redirect(new URL(`/auth?error=token_exchange_failed&details=${encodeURIComponent(errorText)}`, origin));
      }

      const tokenData = await tokenResponse.json();
      
      // Créer une réponse avec redirection
      const response = NextResponse.redirect(new URL('/auth/setup', origin));
      
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
      console.error('Erreur échange code/token:', error);
      return NextResponse.redirect(new URL('/auth?error=token_exchange_failed', origin));
    }

  } catch (error) {
    console.error('Erreur callback:', error);
    return NextResponse.redirect(new URL('/auth?error=server_error', origin));
  }
}