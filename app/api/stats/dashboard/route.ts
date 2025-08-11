import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      // Statistiques depuis la BD locale
      const [
        totalLicences,
        totalMontant,
        packStats,
        recentLicences
      ] = await Promise.all([
        // Total des licences
        prisma.licence.count(),
        
        // Montant total des donations
        prisma.licence.aggregate({
          _sum: {
            montant_paye: true
          }
        }),
        
        // Statistiques par pack
        prisma.licence.groupBy({
          by: ['pack_donation_id'],
          _count: {
            id: true
          },
          _sum: {
            montant_paye: true
          }
        }),
        
        // Licences récentes
        prisma.licence.findMany({
          take: 5,
          orderBy: {
            created_at: 'desc'
          },
          include: {
            pack: true
          }
        })
      ])

      // Récupérer le nombre de joueurs uniques
      const joueursUniques = await prisma.licence.findMany({
        select: {
          joueur_oauth_id: true
        },
        distinct: ['joueur_oauth_id']
      })

      const stats = {
        total_joueurs_soutenus: joueursUniques.length,
        total_licences: totalLicences,
        total_donations: Number(totalMontant._sum.montant_paye || 0),
        moyenne_par_licence: totalLicences > 0 ? 
          Number(totalMontant._sum.montant_paye || 0) / totalLicences : 0,
        packs_populaires: packStats.map(pack => ({
          pack_id: pack.pack_donation_id,
          nombre_licences: pack._count.id,
          montant_total: Number(pack._sum.montant_paye || 0)
        })),
        licences_recentes: recentLicences.map(licence => ({
          id: licence.id,
          joueur_id: licence.joueur_oauth_id,
          pack_nom: licence.pack.nom,
          montant: Number(licence.montant_paye),
          date: licence.created_at
        }))
      }

      await prisma.$disconnect()
      
      return NextResponse.json({
        success: true,
        data: stats
      })
    } catch (dbError) {
      console.error('Erreur BD dashboard stats:', dbError)
      await prisma.$disconnect()
      
      // Statistiques par défaut si erreur BD
      return NextResponse.json({
        success: true,
        data: {
          total_joueurs_soutenus: 0,
          total_licences: 0,
          total_donations: 0,
          moyenne_par_licence: 0,
          packs_populaires: [],
          licences_recentes: []
        }
      })
    }
  } catch (error) {
    console.error('Erreur dashboard stats:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 })
  }
}