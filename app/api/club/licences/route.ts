import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getClubLicences } from '@/lib/services/clubService'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.user_type !== 'club') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const licences = await getClubLicences(user.sub)
    return NextResponse.json(licences)
  } catch (error) {
    console.error('Error fetching club licences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}