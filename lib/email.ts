import nodemailer from 'nodemailer';
import { getOAuthConfig } from './auth';

// Fonction pour récupérer les infos du joueur depuis OAuth
export async function getPlayerInfo(playerId: string) {
  try {
    const response = await fetch(`${getOAuthConfig().issuer}/api/public/players/${playerId}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Erreur récupération info joueur:', error);
  }
  return null;
}

// Fonction pour récupérer les infos du club depuis OAuth
export async function getClubInfo(clubId: string) {
  try {
    const response = await fetch(`${getOAuthConfig().issuer}/api/public/clubs/${clubId}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Erreur récupération info club:', error);
  }
  return null;
}

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
    console.log(`Email envoyé avec succès à ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`Erreur envoi email à ${to}:`, error);
    return { success: false, error };
  }
}

export function generateThankYouEmail(donorName: string, amount: number, childName: string, packName: string) {
  const { emailTemplateService } = require('./emailTemplateService');
  return emailTemplateService.generateDonorThankYouEmail(donorName, amount, childName, packName);
}

export function generatePlayerNotificationEmail(playerName: string, amount: number, donorName: string, packName: string, isAnonymous: boolean) {
  const { emailTemplateService } = require('./emailTemplateService');
  return emailTemplateService.generatePlayerNotificationEmail(playerName, amount, donorName, packName, isAnonymous);
}

export function generateClubNotificationEmail(clubName: string, playerName: string, amount: number, donorName: string, packName: string, isAnonymous: boolean) {
  const { emailTemplateService } = require('./emailTemplateService');
  return emailTemplateService.generateClubNotificationEmail(clubName, playerName, amount, donorName, packName, isAnonymous);
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
  clubName?: string;
  playerEmail?: string;
  clubEmail?: string;
}) {
  const { emailTemplateService } = require('./emailTemplateService');
  return emailTemplateService.generateAdminNotificationEmail(donationData);
}