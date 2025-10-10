import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { dryRun = true } = await request.json();
    
    console.log(`Starting parrain fix process (dryRun: ${dryRun})`);
    
    // Trouver toutes les donations sans parrain
    const donationsWithoutParrain = await prisma.donation.findMany({
      where: {
        parrain_id: null
      },
      include: {
        joueur: true
      }
    });
    
    console.log(`Found ${donationsWithoutParrain.length} donations without parrain`);
    
    const results = [];
    
    for (const donation of donationsWithoutParrain) {
      const donorId = donation.donateur_id || `anonymous_${donation.stripe_session_id}`;
      const donorEmail = donation.donateur_email || `${donorId}@anonymous.paiecashplay.com`;
      const donorName = donation.donateur_nom || 'Donateur Anonyme';
      
      if (!dryRun) {
        try {
          await prisma.$transaction(async (tx) => {
            // Créer le parrain
            const parrain = await tx.parrain.upsert({
              where: {
                donateur_id_joueur_id: {
                  donateur_id: donorId,
                  joueur_id: donation.joueur_id
                }
              },
              update: {
                total_donne: { increment: Number(donation.montant) },
                nombre_dons: { increment: 1 },
                date_dernier_don: donation.date_paiement || donation.date_creation,
                donateur_email: donorEmail,
                donateur_nom: donorName
              },
              create: {
                donateur_id: donorId,
                donateur_email: donorEmail,
                donateur_nom: donorName,
                joueur_id: donation.joueur_id,
                total_donne: Number(donation.montant),
                nombre_dons: 1,
                is_anonymous: donation.is_anonymous,
                date_premier_don: donation.date_paiement || donation.date_creation,
                date_dernier_don: donation.date_paiement || donation.date_creation
              }
            });
            
            // Lier la donation au parrain
            await tx.donation.update({
              where: { id: donation.id },
              data: { parrain_id: parrain.id }
            });
            
            // Recalculer les stats du joueur
            const parrainCount = await tx.parrain.count({
              where: { joueur_id: donation.joueur_id }
            });
            
            await tx.joueur.update({
              where: { id: donation.joueur_id },
              data: { nombre_donateurs: parrainCount }
            });
          });
          
          results.push({
            donation_id: donation.id,
            joueur_id: donation.joueur_id,
            donateur_id: donorId,
            status: 'fixed'
          });
        } catch (error) {
          results.push({
            donation_id: donation.id,
            joueur_id: donation.joueur_id,
            donateur_id: donorId,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      } else {
        results.push({
          donation_id: donation.id,
          joueur_id: donation.joueur_id,
          donateur_id: donorId,
          donateur_email: donorEmail,
          donateur_nom: donorName,
          montant: Number(donation.montant),
          status: 'would_fix'
        });
      }
    }
    
    const summary = {
      total_donations_checked: donationsWithoutParrain.length,
      fixed: results.filter(r => r.status === 'fixed').length,
      errors: results.filter(r => r.status === 'error').length,
      would_fix: results.filter(r => r.status === 'would_fix').length
    };
    
    return NextResponse.json({
      success: true,
      dryRun,
      summary,
      results: dryRun ? results.slice(0, 10) : results
    });
    
  } catch (error) {
    console.error('Error fixing missing parrains:', error);
    return NextResponse.json({
      success: false,
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}