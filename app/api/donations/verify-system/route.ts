import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const results = {
      webhook_data_storage: false,
      parrain_creation: false,
      statistics_accuracy: false,
      donor_dashboard: false,
      player_profile: false,
      club_profile: false,
      issues: [] as string[]
    };

    // 1. Vérifier le stockage des données de webhook
    const recentDonations = await prisma.donation.findMany({
      where: { 
        statut: 'completed',
        date_creation: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Dernières 24h
        }
      },
      include: { parrain: true }
    });

    if (recentDonations.length > 0) {
      results.webhook_data_storage = true;
      
      // Vérifier que chaque donation a un parrain
      const donationsWithoutParrain = recentDonations.filter(d => !d.parrain_id);
      if (donationsWithoutParrain.length === 0) {
        results.parrain_creation = true;
      } else {
        results.issues.push(`${donationsWithoutParrain.length} donations récentes sans parrain`);
      }
    }

    // 2. Vérifier la précision des statistiques
    const [totalDonationsDB, totalMontantDB] = await Promise.all([
      prisma.donation.count({ where: { statut: 'completed' } }),
      prisma.donation.aggregate({
        where: { statut: 'completed' },
        _sum: { montant: true }
      })
    ]);

    // Vérifier que les stats du dashboard correspondent
    try {
      const statsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/stats/dashboard`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          const statsTotal = Math.round(statsData.data.total_donations);
          const dbTotal = Math.round(Number(totalMontantDB._sum.montant || 0));
          
          if (Math.abs(statsTotal - dbTotal) <= 1) { // Tolérance de 1€ pour les arrondis
            results.statistics_accuracy = true;
          } else {
            results.issues.push(`Incohérence stats: Dashboard ${statsTotal}€ vs BD ${dbTotal}€`);
          }
        }
      }
    } catch (error) {
      results.issues.push('Impossible de vérifier les statistiques du dashboard');
    }

    // 3. Vérifier le dashboard donateur
    const parrains = await prisma.parrain.findMany({
      include: {
        donations: true,
        joueur: true
      },
      take: 3
    });

    if (parrains.length > 0) {
      let donorDashboardOk = true;
      
      for (const parrain of parrains) {
        // Vérifier cohérence des totaux
        const realTotal = parrain.donations.reduce((sum, d) => sum + Number(d.montant), 0);
        const storedTotal = Number(parrain.total_donne);
        
        if (Math.abs(realTotal - storedTotal) > 0.01) {
          donorDashboardOk = false;
          results.issues.push(`Parrain ${parrain.id}: total stocké ${storedTotal}€ vs réel ${realTotal}€`);
        }
        
        if (parrain.donations.length !== parrain.nombre_dons) {
          donorDashboardOk = false;
          results.issues.push(`Parrain ${parrain.id}: nombre dons stocké ${parrain.nombre_dons} vs réel ${parrain.donations.length}`);
        }
      }
      
      results.donor_dashboard = donorDashboardOk;
    }

    // 4. Vérifier les profils joueurs
    const joueurs = await prisma.joueur.findMany({
      include: {
        parrains: true,
        donations: true
      },
      take: 3
    });

    if (joueurs.length > 0) {
      let playerProfileOk = true;
      
      for (const joueur of joueurs) {
        // Vérifier cohérence des totaux reçus
        const realTotal = joueur.donations.reduce((sum, d) => sum + Number(d.montant), 0);
        const storedTotal = Number(joueur.total_dons_recus);
        
        if (Math.abs(realTotal - storedTotal) > 0.01) {
          playerProfileOk = false;
          results.issues.push(`Joueur ${joueur.id}: total reçu stocké ${storedTotal}€ vs réel ${realTotal}€`);
        }
        
        if (joueur.parrains.length !== joueur.nombre_donateurs) {
          playerProfileOk = false;
          results.issues.push(`Joueur ${joueur.id}: nombre parrains stocké ${joueur.nombre_donateurs} vs réel ${joueur.parrains.length}`);
        }
      }
      
      results.player_profile = playerProfileOk;
    }

    // 5. Vérifier les profils clubs (basé sur les joueurs du club)
    const clubsWithPlayers = await prisma.joueur.groupBy({
      by: ['club_nom'],
      where: {
        club_nom: { not: null }
      },
      _count: { id: true },
      _sum: { total_dons_recus: true }
    });

    results.club_profile = clubsWithPlayers.length > 0;

    // Résumé final
    const allSystemsOk = Object.values(results).every(v => 
      typeof v === 'boolean' ? v : true
    ) && results.issues.length === 0;

    return NextResponse.json({
      success: true,
      all_systems_operational: allSystemsOk,
      details: results,
      summary: {
        donations_stored: totalDonationsDB,
        total_amount: Number(totalMontantDB._sum.montant || 0),
        parrains_count: await prisma.parrain.count(),
        players_count: await prisma.joueur.count(),
        issues_count: results.issues.length
      },
      recommendations: results.issues.length > 0 ? [
        'Exécuter le script de correction des parrains manquants',
        'Vérifier la synchronisation des webhooks Stripe',
        'Recalculer les statistiques des joueurs'
      ] : [
        'Système opérationnel - aucune action requise'
      ]
    });

  } catch (error) {
    console.error('Erreur vérification système:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}