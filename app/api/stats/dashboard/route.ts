import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      // Statistiques réelles depuis la table Donation
      const [
        totalDonations,
        totalMontant,
        packStats,
        recentDonations,
        totalLicences
      ] = await Promise.all([
        // Total des donations complétées
        prisma.donation.count({
          where: { statut: 'completed' }
        }),
        
        // Montant total des donations complétées
        prisma.donation.aggregate({
          where: { statut: 'completed' },
          _sum: {
            montant: true
          }
        }),
        
        // Statistiques par pack de donation
        prisma.donation.groupBy({
          where: { statut: 'completed' },
          by: ['pack_nom'],
          _count: {
            id: true
          },
          _sum: {
            montant: true
          }
        }),
        
        // Donations récentes
        prisma.donation.findMany({
          where: { statut: 'completed' },
          take: 5,
          orderBy: {
            date_paiement: 'desc'
          },
          include: {
            joueur: true
          }
        }),
        
        // Total des licences actives
        prisma.licence.count({
          where: { statut: 'active' }
        })
      ])

      // Récupérer le nombre de joueurs uniques ayant reçu des donations
      const joueursUniques = await prisma.donation.findMany({
        where: { statut: 'completed' },
        select: {
          joueur_id: true
        },
        distinct: ['joueur_id']
      })

      const stats = {
        total_joueurs_soutenus: joueursUniques.length,
        total_licences: totalLicences,
        total_donations: Number(totalMontant._sum.montant || 0),
        moyenne_par_licence: totalDonations > 0 ? 
          Number(totalMontant._sum.montant || 0) / totalDonations : 0,
        packs_populaires: packStats.map(pack => ({
          pack_nom: pack.pack_nom,
          nombre_donations: pack._count.id,
          montant_total: Number(pack._sum.montant || 0)
        })),
        donations_recentes: recentDonations.map(donation => ({
          id: donation.id,
          joueur_nom: `${donation.joueur.prenom} ${donation.joueur.nom}`,
          pack_nom: donation.pack_nom,
          montant: Number(donation.montant),
          date: donation.date_paiement,
          is_anonymous: donation.is_anonymous
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
          donations_recentes: []
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