import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth'; // <-- Doit accepter un `string`

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // Liste des chemins publics qui ne nécessitent pas d'authentification
  const publicPaths = ['/auth/login', '/auth/register', '/', '/solutions'];

  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    // On vérifie la validité du token
    await verifyAuth(token); // ✅ Ici le token est une string
    return NextResponse.next();
  } catch (error) {
    console.error('Erreur middleware auth :', error);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
