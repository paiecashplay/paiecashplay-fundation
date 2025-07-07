import { NextResponse } from 'next/server';
import { getChildrenWithoutLicense } from '@/lib/services/enfantService';

export async function GET() {
  try {
    const children = await getChildrenWithoutLicense();
    return NextResponse.json({ success: true, data: children });
  } catch (error) {
    console.error('Erreur récupération enfants sans licence:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}