import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCurrentUser, revokeToken } from '@/lib/auth'

export async function GET() {
  const cookieStore = await cookies()
  const user = await getCurrentUser()
  
  // Révoquer les tokens OAuth si disponibles
  if (user?.access_token) {
    await revokeToken(user.access_token, 'access_token')
  }
  if (user?.refresh_token) {
    await revokeToken(user.refresh_token, 'refresh_token')
  }
  
  // Supprimer le cookie de session
  cookieStore.delete('auth-token')
  
  // Rediriger vers la page d'accueil avec marqueur de force login
  const response = NextResponse.redirect(new URL('/?logged_out=true', process.env.OAUTH_REDIRECT_URI!.replace('/api/auth/callback', '')))
  
  return response
}