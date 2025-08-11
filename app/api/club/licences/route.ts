import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getClubLicences } from '@/lib/services/licenceService'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (user.user_type !== 'club') {
      return NextResponse.json({ error: 'Accès refusé - Réservé aux clubs' }, { status: 403 })
    }

    const licences = await getClubLicences(user.sub)
    return NextResponse.json({ success: true, data: licences })
  } catch (error) {
    console.error('Erreur récupération licences:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}