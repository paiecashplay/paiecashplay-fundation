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
  
  // Rediriger vers la page d'accueil du site
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL  || 'http://localhost:3001'
  return NextResponse.redirect(new URL('/', baseUrl))
}