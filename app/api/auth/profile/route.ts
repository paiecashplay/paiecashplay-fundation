import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, getOAuthConfig } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !user.access_token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()

    const config = getOAuthConfig()
    const response = await fetch(`${config.issuer}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${user.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ 
        error: error.message || 'Erreur lors de la mise à jour' 
      }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Erreur mise à jour profil:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}