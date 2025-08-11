import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      // Récupérer le pack "Champion Equipment"
      const championPack = await prisma.packDonation.findFirst({
        where: {
          code: 'championEquipment'
        }
      })

      if (!championPack) {
        await prisma.$disconnect()
        return NextResponse.json({
          success: true,
          data: {
            current: 0,
            goal: 100,
            pack_name: 'Champion Equipment'
          }
        })
      }

      // Compter les licences du pack Champion Equipment ce mois-ci
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const currentMonthLicences = await prisma.licence.count({
        where: {
          pack_donation_id: championPack.id,
          created_at: {
            gte: startOfMonth
          }
        }
      })

      await prisma.$disconnect()

      return NextResponse.json({
        success: true,
        data: {
          current: currentMonthLicences,
          goal: 100,
          pack_name: championPack.nom
        }
      })

    } catch (dbError) {
      console.error('Erreur BD challenge:', dbError)
      await prisma.$disconnect()
      
      return NextResponse.json({
        success: true,
        data: {
          current: 0,
          goal: 100,
          pack_name: 'Champion Equipment'
        }
      })
    }
  } catch (error) {
    console.error('Erreur challenge mensuel:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 })
  }
}