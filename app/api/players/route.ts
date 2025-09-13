import { NextResponse } from 'next/server'
import { getCurrentUser, getOAuthConfig } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (!user.access_token) {
      return NextResponse.json({ error: 'Token d\'accès manquant' }, { status: 401 })
    }

    // Récupérer tous les joueurs depuis l'API OAuth
    const config = getOAuthConfig()
    const response = await fetch(`${config.issuer}/api/oauth/players`, {
      headers: {
        'Authorization': `Bearer ${user.access_token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Erreur API OAuth: ${response.status}`)
    }

    const result = await response.json()
    const players = result.players || []
    
    return NextResponse.json(players)
  } catch (error) {
    console.error('Erreur récupération joueurs:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}