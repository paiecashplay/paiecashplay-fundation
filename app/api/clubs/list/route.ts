import { NextResponse } from 'next/server'
import { getOAuthConfig } from '@/lib/auth'

export async function GET() {
  try {
    const config = getOAuthConfig()
    const response = await fetch(`${config.issuer}/api/public/clubs?limit=100`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des clubs' },
        { status: 500 }
      )
    }

    const clubsData = await response.json()
    console.log('Clubs récupérés:', clubsData)
    
    return NextResponse.json({
      success: true,
      clubs: clubsData.clubs || []
    })
  } catch (error) {
    console.error('Erreur récupération clubs:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}