import jwt from 'jsonwebtoken'

export interface User {
  sub: string
  email: string
  email_verified: boolean
  name: string
  given_name: string
  family_name: string
  picture?: string
  user_type: 'player' | 'club' | 'federation' | 'donor' | 'company' | 'affiliate' | 'admin'
  metadata?: {
    organizationName?: string
    federation?: string
    [key: string]: any
  }
  access_token?: string
  refresh_token?: string
}

export interface AuthTokens {
  access_token: string
  refresh_token?: string
  id_token?: string
  token_type: string
  expires_in: number
}

const JWT_SECRET = process.env.JWT_SECRET!

// Configuration dynamique basée sur l'environnement
export function getOAuthConfig() {
  const isProduction = process.env.NODE_ENV === 'production'
  
  // Utiliser APP_URL pour construire l'URL de redirection
  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
  const oauthIssuer = process.env.OAUTH_ISSUER || 'http://localhost:3000'
  
  // Si on est en production et qu'on a encore localhost, forcer la config production
  if (isProduction && oauthIssuer.includes('localhost')) {
    console.warn('⚠️  Configuration OAuth localhost détectée en production, utilisation des valeurs par défaut')
    return {
      issuer: 'https://auth.paiecashplay.com',
      redirectUri: 'https://fundation.paiecashplay.com/api/auth/callback'
    }
  }
  
  return {
    issuer: oauthIssuer,
    redirectUri: process.env.OAUTH_REDIRECT_URI || `${appUrl}/api/auth/callback`
  }
}

// Générer un state aléatoire pour la sécurité CSRF
export function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Construire l'URL d'autorisation
export function getAuthorizationUrl(state: string, forceLogin = false): string {
  const config = getOAuthConfig()
  const params = new URLSearchParams()
  params.set('response_type', 'code')
  params.set('client_id', process.env.OAUTH_CLIENT_ID!)
  params.set('redirect_uri', config.redirectUri || '')
  params.set('scope', 'openid profile email clubs:read clubs:write clubs:members users:write users:read players:read players:write')
  params.set('state', state)
  
  if (forceLogin) {
    params.set('prompt', 'login')
  }
  
  return `${config.issuer}/api/auth/authorize?${params}`
}

// Échanger le code contre des tokens
export async function exchangeCodeForTokens(code: string): Promise<AuthTokens> {
  const config = getOAuthConfig()
  console.log('Config OAuth:', { issuer: config.issuer, redirectUri: config.redirectUri })
  
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.redirectUri,
    client_id: process.env.OAUTH_CLIENT_ID!,
    client_secret: process.env.OAUTH_CLIENT_SECRET!
  })
  
  console.log('Paramètres token exchange:', {
    grant_type: 'authorization_code',
    code: code.substring(0, 10) + '...',
    redirect_uri: config.redirectUri,
    client_id: process.env.OAUTH_CLIENT_ID
  })
  
  const response = await fetch(`${config.issuer}/api/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Erreur token exchange:', response.status, errorText)
    throw new Error(`Failed to exchange code for tokens: ${response.status} ${errorText}`)
  }
  
  const tokens = await response.json()
  console.log('Tokens reçus:', { 
    access_token: tokens.access_token ? tokens.access_token.substring(0, 20) + '...' : 'missing',
    token_type: tokens.token_type,
    expires_in: tokens.expires_in
  })
  
  return tokens
}

// Récupérer les informations utilisateur
export async function getUserInfo(accessToken: string): Promise<User> {
  const config = getOAuthConfig()
  const response = await fetch(`${config.issuer}/api/auth/userinfo`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Erreur getUserInfo:', response.status, errorText)
    throw new Error(`Failed to get user info: ${response.status} ${errorText}`)
  }
  
  return response.json()
}

// Créer une session locale avec JWT
export function createSession(user: User, tokens: AuthTokens): string {
  const { exp, iat, ...cleanUser } = user as any
  const sessionData = {
    ...cleanUser,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token
  }
  return jwt.sign(sessionData, JWT_SECRET, { expiresIn: '7d' })
}

// Vérifier et décoder une session
export function verifySession(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User
  } catch {
    return null
  }
}

// Rafraîchir le token d'accès
export async function refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
  const config = getOAuthConfig()
  const response = await fetch(`${config.issuer}/api/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.OAUTH_CLIENT_ID!,
      client_secret: process.env.OAUTH_CLIENT_SECRET!
    })
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Erreur refresh token:', response.status, errorText)
    throw new Error(`Failed to refresh token: ${response.status} ${errorText}`)
  }
  
  return response.json()
}

// Récupérer l'utilisateur actuel depuis les cookies (server-side)
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) return null
    
    const user = verifySession(token)
    if (!user) return null
    
    // Vérifier si le token est expiré et le rafraîchir si nécessaire
    if (user.refresh_token) {
      try {
        // Test rapide du token actuel
        const config = getOAuthConfig()
        const testResponse = await fetch(`${config.issuer}/api/auth/userinfo`, {
          headers: { 'Authorization': `Bearer ${user.access_token}` }
        })
        
        if (!testResponse.ok && testResponse.status === 401) {
          console.log('Token expiré, refresh token aussi expiré - déconnexion nécessaire')
          // Les deux tokens sont expirés, supprimer la session
          cookieStore.delete('auth-token')
          return null
        }
      } catch (error) {
        console.error('Erreur lors du rafraîchissement du token:', error)
        return null
      }
    }
    
    return user
  } catch {
    return null
  }
}

// Révoquer un token OAuth
export async function revokeToken(token: string, tokenType: 'access_token' | 'refresh_token' = 'access_token'): Promise<boolean> {
  try {
    const config = getOAuthConfig()
    const response = await fetch(`${config.issuer}/api/auth/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token,
        token_type_hint: tokenType,
        client_id: process.env.OAUTH_CLIENT_ID!,
        client_secret: process.env.OAUTH_CLIENT_SECRET!
      })
    })
    
    return response.ok
  } catch (error) {
    console.error('Error revoking token:', error)
    return false
  }
}

// URL de déconnexion
export function getLogoutUrl(): string {
  const config = getOAuthConfig()
  return `${config.issuer}/api/auth/logout`
}