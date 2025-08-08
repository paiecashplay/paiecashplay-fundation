import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getClubMembers, addClubMember } from '@/lib/services/clubService'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.user_type !== 'club') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user.access_token) {
      return NextResponse.json({ error: 'No access token available' }, { status: 401 })
    }

    const members = await getClubMembers(user.sub, user.access_token)
    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching club members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.user_type !== 'club') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user.access_token) {
      return NextResponse.json({ error: 'No access token available' }, { status: 401 })
    }

    const memberData = await request.json()
    const success = await addClubMember(user.sub, user.access_token, memberData)
    
    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Failed to add member' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error adding club member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}