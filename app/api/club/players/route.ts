import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getClubMembers } from '@/lib/services/clubService'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.user_type !== 'club') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user.access_token) {
      return NextResponse.json({ error: 'No access token available' }, { status: 401 })
    }

    const players = await getClubMembers(user.sub)
    return NextResponse.json(players)
  } catch (error) {
    console.error('Error fetching club players:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}