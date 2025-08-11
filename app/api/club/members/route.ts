import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getClubMembers } from '@/lib/services/clubService'

export async function GET(request: NextRequest) {
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

    const members = await getClubMembers(user.sub)

    return NextResponse.json({
      success: true,
      data: members
    })

  } catch (error) {
    console.error('Erreur récupération membres:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Erreur serveur'
      },
      { status: 500 }
    )
  }
}