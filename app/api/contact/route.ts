import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, phone, source, message } = data;

    // Validation des champs requis
    if (!name || !email || !phone || !source || !message) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Avec EmailJS, nous n'avons pas besoin de traiter l'email côté serveur
    // car l'envoi se fait directement depuis le client
    
    return NextResponse.json(
      { success: true, message: 'Votre message a été enregistré avec succès' },
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