import { NextResponse } from 'next/server';
import { generateThankYouEmail, generatePlayerNotificationEmail, generateClubNotificationEmail, generateAdminNotificationEmail, sendEmail } from '@/lib/email';

export async function POST() {
  try {
    const testData = {
      donorName: 'Jean Dupont',
      playerName: 'Ahmed Kone',
      clubName: 'FC Marseille',
      amount: 50,
      packName: 'License Solidaire',
      isAnonymous: false,
      donationId: 'test-123',
      stripeSessionId: 'cs_test_123',
      stripePaymentId: 'pi_test_123'
    };

    const results = {
      donor_email: false,
      player_email: false,
      club_email: false,
      admin_email: false,
      errors: [] as string[]
    };

    // Test email donateur
    try {
      const donorEmail = generateThankYouEmail(
        testData.donorName,
        testData.amount,
        testData.playerName,
        testData.packName
      );
      
      // Remplacer par un vrai email de test si nécessaire
      const testDonorEmail = process.env.TEST_EMAIL || 'test@paiecashplay.com';
      await sendEmail(testDonorEmail, 'Test - Merci pour votre don', donorEmail);
      results.donor_email = true;
    } catch (error) {
      results.errors.push(`Email donateur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    // Test email joueur
    try {
      const playerEmail = generatePlayerNotificationEmail(
        testData.playerName,
        testData.amount,
        testData.donorName,
        testData.packName,
        testData.isAnonymous
      );
      
      const testPlayerEmail = process.env.TEST_EMAIL || 'test@paiecashplay.com';
      await sendEmail(testPlayerEmail, 'Test - Nouveau don reçu', playerEmail);
      results.player_email = true;
    } catch (error) {
      results.errors.push(`Email joueur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    // Test email club
    try {
      const clubEmail = generateClubNotificationEmail(
        testData.clubName,
        testData.playerName,
        testData.amount,
        testData.donorName,
        testData.packName,
        testData.isAnonymous
      );
      
      const testClubEmail = process.env.TEST_EMAIL || 'test@paiecashplay.com';
      await sendEmail(testClubEmail, 'Test - Nouveau don pour votre club', clubEmail);
      results.club_email = true;
    } catch (error) {
      results.errors.push(`Email club: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    // Test email admin
    try {
      const adminEmail = generateAdminNotificationEmail({
        donationId: testData.donationId,
        amount: testData.amount,
        childName: testData.playerName,
        packName: testData.packName,
        donorEmail: 'jean.dupont@email.com',
        donorName: testData.donorName,
        isAnonymous: testData.isAnonymous,
        stripeSessionId: testData.stripeSessionId,
        stripePaymentId: testData.stripePaymentId,
        type: 'Don unique',
        clubName: testData.clubName,
        playerEmail: 'ahmed.kone@email.com',
        clubEmail: 'contact@fcmarseille.com'
      });
      
      const testAdminEmail = process.env.TEST_EMAIL || 'test@paiecashplay.com';
      await sendEmail(testAdminEmail, 'Test - Nouvelle donation reçue', adminEmail);
      results.admin_email = true;
    } catch (error) {
      results.errors.push(`Email admin: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    const allEmailsWorking = results.donor_email && results.player_email && results.club_email && results.admin_email;

    return NextResponse.json({
      success: true,
      all_emails_working: allEmailsWorking,
      results,
      message: allEmailsWorking 
        ? 'Tous les emails de test ont été envoyés avec succès'
        : `${results.errors.length} erreur(s) détectée(s)`,
      test_data: testData,
      smtp_config: {
        host: process.env.SMTP_HOST ? '✓ Configuré' : '✗ Manquant',
        port: process.env.SMTP_PORT ? '✓ Configuré' : '✗ Manquant',
        user: process.env.SMTP_USER ? '✓ Configuré' : '✗ Manquant',
        password: process.env.SMTP_PASSWORD ? '✓ Configuré' : '✗ Manquant',
        from_name: process.env.FROM_NAME ? '✓ Configuré' : '✗ Manquant',
        from_email: process.env.FROM_EMAIL ? '✓ Configuré' : '✗ Manquant'
      }
    });

  } catch (error) {
    console.error('Erreur test emails:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}