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
    console.log('Echange du code pour les tokens...')
    const tokens = await exchangeCodeForTokens(code)
    console.log('Tokens reçus:', { access_token: tokens.access_token ? 'present' : 'missing' })
    
    // Récupérer les infos utilisateur
    console.log('Récupération des infos utilisateur...')
    const user = await getUserInfo(tokens.access_token)
    console.log('Utilisateur récupéré:', { sub: user.sub, email: user.email })
    
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
    
    // Rediriger vers la page d'accueil en utilisant APP_URL
    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || new URL('/', request.url).origin
    return NextResponse.redirect(new URL('/', appUrl))
    
  } catch (error) {
    console.error('OAuth callback error:', error)
    
    // Rediriger vers la page d'accueil avec un message d'erreur
    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || new URL('/', request.url).origin
    const errorUrl = new URL('/', appUrl)
    errorUrl.searchParams.set('auth_error', 'Service d\'authentification temporairement indisponible')
    
    return NextResponse.redirect(errorUrl)
  }
}