import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('=== TEST DES DONNÉES DE DONATIONS ===');
    
    // 1. Vérifier les donations
    const donations = await prisma.donation.findMany({
      where: { statut: 'completed' },
      include: {
        joueur: true,
        parrain: true
      },
      orderBy: { date_paiement: 'desc' },
      take: 5
    });
    
    console.log(`✅ ${donations.length} donations trouvées`);
    donations.forEach(donation => {
      console.log(`- Donation ${donation.id}: ${donation.montant}€ pour ${donation.joueur.prenom} ${donation.joueur.nom}`);
      console.log(`  Parrain: ${donation.parrain?.donateur_nom || 'Aucun'} (${donation.parrain?.donateur_id || 'N/A'})`);
      console.log(`  Anonyme: ${donation.is_anonymous ? 'Oui' : 'Non'}`);
    });
    
    // 2. Vérifier les parrains
    const parrains = await prisma.parrain.findMany({
      include: {
        joueur: true,
        _count: {
          select: {
            donations: true
          }
        }
      },
      orderBy: { total_donne: 'desc' },
      take: 5
    });
    
    console.log(`✅ ${parrains.length} parrains trouvés`);
    parrains.forEach(parrain => {
      console.log(`- Parrain ${parrain.id}: ${parrain.donateur_nom} (${parrain.donateur_id})`);
      console.log(`  Total donné: ${parrain.total_donne}€ en ${parrain.nombre_dons} dons`);
      console.log(`  Joueur: ${parrain.joueur.prenom} ${parrain.joueur.nom}`);
      console.log(`  Donations liées: ${parrain._count.donations}`);
    });
    
    // 3. Vérifier les joueurs avec leurs stats
    const joueurs = await prisma.joueur.findMany({
      include: {
        _count: {
          select: {
            parrains: true,
            donations: true
          }
        }
      },
      orderBy: { total_dons_recus: 'desc' },
      take: 5
    });
    
    console.log(`✅ ${joueurs.length} joueurs trouvés`);
    joueurs.forEach(joueur => {
      console.log(`- Joueur ${joueur.id}: ${joueur.prenom} ${joueur.nom} (${joueur.oauth_id})`);
      console.log(`  Total reçu: ${joueur.total_dons_recus}€`);
      console.log(`  Nombre parrains: ${joueur.nombre_donateurs} (BD: ${joueur._count.parrains})`);
      console.log(`  Donations reçues: ${joueur._count.donations}`);
    });
    
    // 4. Statistiques globales
    const [totalDonations, totalMontant, totalParrains, totalJoueurs] = await Promise.all([
      prisma.donation.count({ where: { statut: 'completed' } }),
      prisma.donation.aggregate({
        where: { statut: 'completed' },
        _sum: { montant: true }
      }),
      prisma.parrain.count(),
      prisma.joueur.count()
    ]);
    
    console.log('=== STATISTIQUES GLOBALES ===');
    console.log(`Total donations: ${totalDonations}`);
    console.log(`Montant total: ${totalMontant._sum.montant || 0}€`);
    console.log(`Total parrains: ${totalParrains}`);
    console.log(`Total joueurs: ${totalJoueurs}`);
    
    // 5. Vérifier la cohérence des données
    const inconsistencies = [];
    
    // Vérifier que chaque donation a un parrain
    const donationsWithoutParrain = await prisma.donation.count({
      where: {
        statut: 'completed',
        parrain_id: null
      }
    });
    
    if (donationsWithoutParrain > 0) {
      inconsistencies.push(`${donationsWithoutParrain} donations sans parrain`);
    }
    
    // Vérifier que les totaux des parrains correspondent
    for (const parrain of parrains) {
      const realTotal = await prisma.donation.aggregate({
        where: {
          parrain_id: parrain.id,
          statut: 'completed'
        },
        _sum: { montant: true },
        _count: { id: true }
      });
      
      const expectedTotal = Number(parrain.total_donne);
      const actualTotal = Number(realTotal._sum.montant || 0);
      
      if (Math.abs(expectedTotal - actualTotal) > 0.01) {
        inconsistencies.push(`Parrain ${parrain.id}: total BD ${expectedTotal}€ vs réel ${actualTotal}€`);
      }
      
      if (parrain.nombre_dons !== realTotal._count.id) {
        inconsistencies.push(`Parrain ${parrain.id}: nombre dons BD ${parrain.nombre_dons} vs réel ${realTotal._count.id}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        donations: donations.map(d => ({
          id: d.id,
          montant: Number(d.montant),
          joueur: `${d.joueur.prenom} ${d.joueur.nom}`,
          parrain: d.parrain?.donateur_nom || 'Aucun',
          is_anonymous: d.is_anonymous,
          date: d.date_paiement
        })),
        parrains: parrains.map(p => ({
          id: p.id,
          nom: p.donateur_nom,
          total_donne: Number(p.total_donne),
          nombre_dons: p.nombre_dons,
          joueur: `${p.joueur.prenom} ${p.joueur.nom}`,
          donations_liees: p._count.donations
        })),
        joueurs: joueurs.map(j => ({
          id: j.id,
          nom: `${j.prenom} ${j.nom}`,
          total_recu: Number(j.total_dons_recus),
          nombre_parrains: j.nombre_donateurs,
          parrains_reels: j._count.parrains,
          donations_recues: j._count.donations
        })),
        stats: {
          total_donations: totalDonations,
          montant_total: Number(totalMontant._sum.montant || 0),
          total_parrains: totalParrains,
          total_joueurs: totalJoueurs
        },
        inconsistencies
      }
    });
    
  } catch (error) {
    console.error('Erreur test données:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}