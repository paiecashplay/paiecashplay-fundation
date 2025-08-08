import { NextRequest, NextResponse } from 'next/server'
import { generateState, getAuthorizationUrl } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const forceLogin = searchParams.get('force_login') === 'true'
  
  const state = generateState()
  
  // Stocker le state dans un cookie pour vérification
  const cookieStore = await cookies()
  cookieStore.set('oauth-state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600 // 10 minutes
  })
  
  const authUrl = getAuthorizationUrl(state, forceLogin)
  return NextResponse.redirect(authUrl)
}