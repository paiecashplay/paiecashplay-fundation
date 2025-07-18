import { NextRequest, NextResponse } from 'next/server';

// Middleware pour vérifier si l'utilisateur est authentifié
export async function requireAuth(request: NextRequest) {
  // Dans un environnement réel, vous vérifieriez le token JWT
  // Pour l'exemple, nous simulons un utilisateur connecté
  
  // Simuler un utilisateur connecté pour l'exemple
  const isAuthenticated = true;
  
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  
  return NextResponse.next();
}

// Middleware pour vérifier si l'utilisateur a un rôle spécifique
export async function requireRole(request: NextRequest, role: string) {
  // D'abord vérifier l'authentification
  const authResult = await requireAuth(request);
  if (authResult.status !== 200) {
    return authResult;
  }
  
  // Dans un environnement réel, vous vérifieriez le rôle dans le token JWT
  // Pour l'exemple, nous simulons un utilisateur avec le rôle admin
  
  // Simuler un utilisateur avec le rôle admin pour l'exemple
  const hasRole = role === 'admin';
  
  if (!hasRole) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  
  return NextResponse.next();
}

// Middleware pour vérifier si l'utilisateur est admin
export async function requireAdmin(request: NextRequest) {
  return requireRole(request, 'admin');
}