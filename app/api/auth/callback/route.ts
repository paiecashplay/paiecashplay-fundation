import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens, getUserInfo, createSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  
  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 })
  }
  
  // Vérifier le state pour la sécurité CSRF
  const cookieStore = await cookies()
  const storedState = cookieStore.get('oauth-state')?.value
  
  if (state !== storedState) {
    return NextResponse.json({ error: 'Invalid state' }, { status: 400 })
  }
  
  try {
    // Échanger le code contre des tokens
    const tokens = await exchangeCodeForTokens(code)
    
    // Récupérer les infos utilisateur
    const user = await getUserInfo(tokens.access_token)
    
    // Créer une session locale
    const sessionToken = createSession(user, tokens)
    
    // Définir le cookie de session
    cookieStore.set('auth-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 jours
    })
    
    // Supprimer le state cookie
    cookieStore.delete('oauth-state')
    
    // Rediriger vers la page d'accueil
    return NextResponse.redirect(new URL('/', request.url))
    
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}