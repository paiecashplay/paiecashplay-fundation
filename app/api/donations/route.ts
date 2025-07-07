import { NextRequest, NextResponse } from 'next/server';
import { createDonation, getActiveDonationPacks } from '@/lib/services/donationService';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  try {
    const packs = await getActiveDonationPacks();
    return NextResponse.json({ success: true, data: packs });
  } catch (error) {
    console.error('Erreur récupération packs:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    const {
      enfant_id,
      pack_donation_id,
      montant,
      type_don,
      message_donateur,
      anonyme
    } = await request.json();

    if (!montant || montant <= 0) {
      return NextResponse.json(
        { error: 'Montant invalide' },
        { status: 400 }
      );
    }

    const donationId = await createDonation({
      user_id: decoded.userId,
      enfant_id,
      pack_donation_id,
      montant,
      type_don,
      message_donateur,
      anonyme
    });

    if (!donationId) {
      return NextResponse.json(
        { error: 'Erreur création donation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      donationId
    });

  } catch (error) {
    console.error('Erreur création donation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}