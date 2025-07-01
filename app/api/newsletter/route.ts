import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Avec EmailJS, nous n'avons pas besoin de traiter l'email côté serveur
    // car l'envoi se fait directement depuis le client
    
    return NextResponse.json(
      { success: true, message: 'Inscription réussie à la newsletter' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors du traitement de la demande:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du traitement de votre demande' },
      { status: 500 }
    );
  }
}