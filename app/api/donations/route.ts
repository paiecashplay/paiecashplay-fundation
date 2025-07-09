import { NextRequest, NextResponse } from 'next/server';
import { createDonation, getActiveDonationPacks } from '@/lib/services/donationService';
import { verifyToken } from '@/lib/auth';

// ---------- GET ----------
export async function GET() {
  try {
    const packs = await getActiveDonationPacks();
    return NextResponse.json({ success: true, data: packs });
  } catch (error) {
    console.error('Erreur récupération packs:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// ---------- POST ----------
export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier l’authentification
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }

    const { valid, admin } = verifyToken(token);
    if (!valid || !admin) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // 2. Extraire le corps de la requête
    const {
      enfant_id,
      pack_donation_id,
      montant,
      type_don,
      message_donateur,
      anonyme
    } = await request.json();

    if (!montant || montant <= 0) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
    }

    // 3. Créer la donation
    const donationId = await createDonation({
      user_id: admin.id,        
      enfant_id,
      pack_donation_id,
      montant,
      type_don,
      message_donateur,
      anonyme
    });

    if (!donationId) {
      return NextResponse.json({ error: 'Erreur création donation' }, { status: 500 });
    }

    // 4. Réponse OK
    return NextResponse.json({ success: true, donationId });

  } catch (error) {
    console.error('Erreur création donation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
