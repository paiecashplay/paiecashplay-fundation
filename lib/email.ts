import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: parseInt(process.env.SMTP_PORT!),
  secure: false,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASSWORD!,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return { success: false, error };
  }
}

export function generateThankYouEmail(donorName: string, amount: number, childName: string, packName: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #4FBA73, #3da562); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Merci pour votre générosité !</h1>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <p>Cher(e) ${donorName},</p>
        
        <p>Nous vous remercions chaleureusement pour votre don de <strong>${amount}€</strong> en faveur de <strong>${childName}</strong>.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #4FBA73; margin-top: 0;">Récapitulatif de votre don</h3>
          <p><strong>Pack choisi :</strong> ${packName}</p>
          <p><strong>Montant :</strong> ${amount}€</p>
          <p><strong>Enfant soutenu :</strong> ${childName}</p>
          <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        
        <p>Grâce à votre soutien, ${childName} pourra continuer à pratiquer le sport et développer son potentiel.</p>
        
        <p>Cordialement,<br>L'équipe PaieCashPlay</p>
      </div>
    </div>
  `;
}

export function generateAdminNotificationEmail(donationData: {
  donationId: string;
  amount: number;
  childName: string;
  packName: string;
  donorEmail: string | null;
  donorName: string | null;
  isAnonymous: boolean;
  stripeSessionId: string;
  stripePaymentId: string;
  type: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">🎉 Nouvelle Donation Reçue</h1>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #1f2937; margin-top: 0;">Détails de la donation</h2>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4FBA73;">
          <h3 style="color: #4FBA73; margin-top: 0;">Informations financières</h3>
          <p><strong>ID Donation :</strong> ${donationData.donationId}</p>
          <p><strong>Montant :</strong> ${donationData.amount}€</p>
          <p><strong>Pack choisi :</strong> ${donationData.packName}</p>
          <p><strong>Type :</strong> ${donationData.type}</p>
          <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <h3 style="color: #3b82f6; margin-top: 0;">Informations du donateur</h3>
          <p><strong>Nom :</strong> ${donationData.isAnonymous ? 'Don anonyme' : (donationData.donorName || 'Non renseigné')}</p>
          <p><strong>Email :</strong> ${donationData.isAnonymous ? 'Don anonyme' : (donationData.donorEmail || 'Non renseigné')}</p>
          <p><strong>Type :</strong> ${donationData.isAnonymous ? 'Anonyme' : 'Identifié'}</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="color: #f59e0b; margin-top: 0;">Enfant bénéficiaire</h3>
          <p><strong>Nom :</strong> ${donationData.childName}</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
          <h3 style="color: #8b5cf6; margin-top: 0;">Informations Stripe</h3>
          <p><strong>Session ID :</strong> ${donationData.stripeSessionId}</p>
          <p><strong>Payment ID :</strong> ${donationData.stripePaymentId}</p>
        </div>
        
        <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #0277bd; font-weight: 500;">💡 Cette donation a été automatiquement traitée et sauvegardée dans la base de données.</p>
        </div>
      </div>
    </div>
  `;
}