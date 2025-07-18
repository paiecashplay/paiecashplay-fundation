import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // En cas d'erreur d'authentification
    if (error) {
      console.error('Erreur Keycloak:', error);
      return NextResponse.redirect(new URL('/auth?error=' + error, request.url));
    }

    // Si pas de code, rediriger vers la page d'authentification
    if (!code) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    // Dans un environnement réel, vous échangeriez le code contre un token
    // Pour l'exemple, nous redirigeons simplement vers la page de setup
    
    // Rediriger vers la page de sélection du type de compte
    return NextResponse.redirect(new URL('/auth/setup', request.url));

  } catch (error) {
    console.error('Erreur callback:', error);
    return NextResponse.redirect(new URL('/auth?error=server_error', request.url));
  }
}