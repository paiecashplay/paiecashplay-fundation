import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Récupérer le chemin de la requête
  const path = request.nextUrl.pathname;
  
  // Vérifier si l'utilisateur est authentifié
  // Dans un environnement réel, vous vérifieriez le token JWT
  // Pour l'exemple, nous simulons un utilisateur connecté
  
  // Simuler un utilisateur connecté pour l'exemple
  const isAuthenticated = true;
  
  // Routes protégées
  if (path.startsWith('/dashboard') || path.startsWith('/admin')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
    
    // Vérifier si l'utilisateur est admin pour les routes admin
    if (path.startsWith('/admin')) {
      // Dans un environnement réel, vous vérifieriez le rôle dans le token JWT
      // Pour l'exemple, nous simulons un utilisateur avec le rôle admin
      
      // Simuler un utilisateur avec le rôle admin pour l'exemple
      const isAdmin = true;
      
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};