import { NextRequest, NextResponse } from 'next/server'
import { getPlayerLicences } from '@/lib/services/licenceService'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const licenses = await getPlayerLicences(id)
    return NextResponse.json(licenses)
  } catch (error) {
    console.error('Erreur récupération licences joueur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des licences' },
      { status: 500 }
    )
  }
}