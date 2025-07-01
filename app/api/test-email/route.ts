import { NextResponse } from 'next/server';
import { saveEmailLocally } from '@/lib/email';

export async function GET() {
  try {
    // Configuration SMTP qui serait utilisée (pour information seulement)
    const smtpConfig = {
      host: process.env.EMAIL_HOST || 'mail.paiecash.com',
      port: process.env.EMAIL_PORT || '587',
      secure: process.env.EMAIL_SECURE === 'true',
      user: process.env.EMAIL_USER || 'info@paiecash.com',
      connectionTimeout: 30000,
      greetingTimeout: 30000
    };

    // Créer un email de test et le sauvegarder localement
    try {
      const testMailOptions = {
        from: 'Système PaieCash <system@paiecash.com>',
        to: 'test@paiecash.com',
        subject: 'Test du système d\'envoi d\'emails',
        html: `
          <h1>Test du système d'envoi d'emails</h1>
          <p>Ceci est un email de test généré automatiquement pour vérifier le fonctionnement du système d'envoi d'emails.</p>
          <p>Date et heure du test: ${new Date().toLocaleString('fr-FR')}</p>
        `,
      };
      
      const result = await saveEmailLocally(testMailOptions);

      return NextResponse.json(
        { 
          success: true, 
          message: 'Email de test sauvegardé localement avec succès',
          result,
          smtpConfig
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde locale:', error);
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Échec de la sauvegarde locale de l\'email de test',
          error: error instanceof Error ? error.message : String(error),
          smtpConfig
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur lors du test d\'email:', error);
    return NextResponse.json(
      { 
        error: 'Une erreur est survenue lors du test d\'email',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}