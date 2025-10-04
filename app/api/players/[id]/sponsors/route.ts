import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Récupérer le joueur local
    const joueur = await prisma.joueur.findUnique({
      where: { oauth_id: id }
    });

    if (!joueur) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // Récupérer les parrains du joueur
    const parrains = await prisma.parrain.findMany({
      where: { joueur_id: joueur.id },
      orderBy: { date_dernier_don: 'desc' },
      include: {
        _count: {
          select: {
            donations: true
          }
        }
      }
    });

    const sponsorsData = parrains.map(parrain => ({
      id: parrain.id,
      donateur_id: parrain.donateur_id,
      donateur_nom: parrain.donateur_nom || 'Donateur anonyme',
      donateur_email: parrain.donateur_email,
      total_donne: Number(parrain.total_donne),
      nombre_dons: parrain.nombre_dons,
      date_premier_don: parrain.created_at,
      date_dernier_don: parrain.date_dernier_don,
      is_anonymous: parrain.is_anonymous,
      nombre_donations: parrain._count.donations
    }));

    return NextResponse.json({
      success: true,
      data: sponsorsData
    });

  } catch (error) {
    console.error('Erreur récupération parrains:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}