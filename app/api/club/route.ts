import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getClubsList } from '@/lib/services/clubService'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const clubs = await getClubsList(user?.access_token)
    
    return NextResponse.json({ clubs })
  } catch (error) {
    console.error('Erreur API clubs:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}