import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCurrentUser, revokeToken, getLogoutUrl } from '@/lib/auth'

export async function POST() {
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
  
  return NextResponse.json({ success: true })
}

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
  
  // Rediriger vers la déconnexion OAuth
  const logoutUrl = getLogoutUrl()
  return NextResponse.redirect(logoutUrl)
}