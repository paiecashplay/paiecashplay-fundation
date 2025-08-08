import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getClubStats } from '@/lib/services/clubService'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.user_type !== 'club') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user.access_token) {
      return NextResponse.json({ error: 'No access token available' }, { status: 401 })
    }

    const stats = await getClubStats(user.sub, user.access_token)
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching club stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}