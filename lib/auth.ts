import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

export interface User {
  sub: string
  email: string
  email_verified: boolean
  name: string
  given_name: string
  family_name: string
  picture?: string
  user_type: 'player' | 'club' | 'federation' | 'donor' | 'company' | 'affiliate'
  metadata?: any
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

// Générer un state aléatoire pour la sécurité CSRF
export function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Construire l'URL d'autorisation
export function getAuthorizationUrl(state: string, forceLogin = false): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.OAUTH_CLIENT_ID!,
    redirect_uri: process.env.OAUTH_REDIRECT_URI!,
    scope: 'openid profile email clubs:read clubs:members users:write',
    state
  })
  
  if (forceLogin) {
    params.set('prompt', 'login')
  }
  
  return `${process.env.OAUTH_ISSUER}/api/auth/authorize?${params}`
}

// Échanger le code contre des tokens
export async function exchangeCodeForTokens(code: string): Promise<AuthTokens> {
  const response = await fetch(`${process.env.OAUTH_ISSUER}/api/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.OAUTH_REDIRECT_URI!,
      client_id: process.env.OAUTH_CLIENT_ID!,
      client_secret: process.env.OAUTH_CLIENT_SECRET!
    })
  })
  
  if (!response.ok) {
    throw new Error('Failed to exchange code for tokens')
  }
  
  return response.json()
}

// Récupérer les informations utilisateur
export async function getUserInfo(accessToken: string): Promise<User> {
  const response = await fetch(`${process.env.OAUTH_ISSUER}/api/auth/userinfo`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  })
  
  if (!response.ok) {
    throw new Error('Failed to get user info')
  }
  
  return response.json()
}

// Créer une session locale avec JWT
export function createSession(user: User, tokens: AuthTokens): string {
  const sessionData = {
    ...user,
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

// Récupérer l'utilisateur actuel depuis les cookies
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) return null
    
    return verifySession(token)
  } catch {
    return null
  }
}

// Révoquer un token OAuth
export async function revokeToken(token: string, tokenType: 'access_token' | 'refresh_token' = 'access_token'): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.OAUTH_ISSUER}/api/auth/revoke`, {
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
  return `${process.env.OAUTH_ISSUER}/api/auth/logout`
}