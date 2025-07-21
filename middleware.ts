import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Chemins protégés qui nécessitent une authentification
const protectedPaths = [
  '/admin',
  '/profile',
  '/dashboard',
];

// Chemins publics qui ne nécessitent pas d'authentification
const publicPaths = [
  '/',
  '/auth',
  '/api/auth/callback',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/token',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Vérifier si le chemin est protégé
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path));
  
  // Si le chemin n'est pas protégé, laisser passer la requête
  if (!isProtectedPath || isPublicPath) {
    return NextResponse.next();
  }
  
  // Vérifier si l'utilisateur est authentifié
  const accessToken = request.cookies.get('access_token')?.value;
  
  if (!accessToken) {
    // Rediriger vers la page d'authentification
    const url = new URL('/auth', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  // Vérifier si le token est valide (cette vérification est simplifiée)
  // Dans un environnement de production, vous devriez vérifier la validité du token
  
  return NextResponse.next();
}

// Configurer les chemins sur lesquels le middleware doit s'exécuter
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|logo.png|images/|public/).*)',
  ],
};