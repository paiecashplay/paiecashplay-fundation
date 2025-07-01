import { NextResponse } from 'next/server';
import { getLocalEmails, getLocalEmailContent } from '@/lib/email';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    
    if (filename) {
      // Récupérer le contenu d'un email spécifique
      const content = getLocalEmailContent(filename);
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    } else {
      // Récupérer la liste des emails
      const emails = getLocalEmails();
      return NextResponse.json({ emails });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des emails:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des emails' },
      { status: 500 }
    );
  }
}