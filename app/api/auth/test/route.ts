import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    // Test de l'API OAuth
    const testResponse = await fetch(`${process.env.NEXT_PUBLIC_OAUTH_ISSUER}/api/auth/userinfo`, {
      headers: {
        'Authorization': `Bearer ${user.access_token}`,
        'Content-Type': 'application/json'
      }
    })
    
    const testData = testResponse.ok ? await testResponse.json() : await testResponse.text()
    
    return NextResponse.json({
      user: {
        sub: user.sub,
        email: user.email,
        user_type: user.user_type,
        token_preview: user.access_token?.substring(0, 20) + '...'
      },
      oauth_test: {
        status: testResponse.status,
        ok: testResponse.ok,
        data: testData
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}