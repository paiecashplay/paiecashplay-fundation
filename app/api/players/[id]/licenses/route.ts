import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const playerId = id;

    // Récupérer toutes les licences du joueur
    const licenses = await prisma.licence.findMany({
      where: { joueur_oauth_id: playerId },
      include: {
        pack: {
          select: {
            nom: true,
            prix: true,
            description: true
          }
        }
      },
      orderBy: { date_emission: 'desc' }
    });

    return NextResponse.json({ licenses });
  } catch (error) {
    console.error('Erreur récupération licences:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}