import { NextResponse } from 'next/server'
import { getActiveDonationPacks } from '@/lib/services/donationService'

export async function GET() {
  try {
    const packs = await getActiveDonationPacks()
    return NextResponse.json({ success: true, data: packs })
  } catch (error) {
    console.error('Erreur récupération packs:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}