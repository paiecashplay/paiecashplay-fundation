import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, getOAuthConfig } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    if (user.user_type !== 'club') {
      return NextResponse.json(
        { error: 'Accès réservé aux clubs' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Ajouter un membre via l'API OAuth
    const config = getOAuthConfig()
    const response = await fetch(`${config.issuer}/api/oauth/clubs/${user.sub}/members`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.message || `Erreur API OAuth: ${response.status}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Erreur ajout membre:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Erreur serveur'
      },
      { status: 500 }
    )
  }
}