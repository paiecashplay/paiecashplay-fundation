import fs from 'fs';
import path from 'path';

interface TemplateData {
  [key: string]: any;
}

interface EmailConfig {
  headerGradient: string;
  accentColor: string;
  accentColorDark: string;
  logoEmoji: string;
  headerTitle: string;
  headerSubtitle: string;
}

const EMAIL_CONFIGS = {
  donor: {
    headerGradient: '#4FBA73, #3da562',
    accentColor: '#4FBA73',
    accentColorDark: '#3da562',
    logoEmoji: '💚',
    headerTitle: 'Merci pour votre générosité !',
    headerSubtitle: 'Votre don fait la différence'
  },
  player: {
    headerGradient: '#4FBA73, #3da562',
    accentColor: '#4FBA73',
    accentColorDark: '#3da562',
    logoEmoji: '⚽',
    headerTitle: 'Vous avez reçu un nouveau don !',
    headerSubtitle: 'Continuez à briller sur le terrain'
  },
  club: {
    headerGradient: '#3b82f6, #1d4ed8',
    accentColor: '#3b82f6',
    accentColorDark: '#1d4ed8',
    logoEmoji: '🏆',
    headerTitle: 'Nouveau don pour votre club !',
    headerSubtitle: 'Vos talents sont reconnus'
  },
  admin: {
    headerGradient: '#2563eb, #1d4ed8',
    accentColor: '#2563eb',
    accentColorDark: '#1d4ed8',
    logoEmoji: '🎉',
    headerTitle: 'Nouvelle Donation Reçue',
    headerSubtitle: 'Notification système'
  }
};

class EmailTemplateService {
  private templatesPath: string;

  constructor() {
    this.templatesPath = path.join(process.cwd(), 'lib', 'email-templates');
  }

  private loadTemplate(templateName: string): string {
    const templatePath = path.join(this.templatesPath, `${templateName}.html`);
    return fs.readFileSync(templatePath, 'utf-8');
  }

  private loadBaseTemplate(): string {
    const basePath = path.join(this.templatesPath, 'base.html');
    return fs.readFileSync(basePath, 'utf-8');
  }

  private renderTemplate(template: string, data: TemplateData): string {
    let rendered = template;
    
    // Remplacer les variables simples {{variable}}
    rendered = rendered.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });

    // Gérer les conditions {{#condition}}...{{/condition}}
    rendered = rendered.replace(/\{\{#(\w+)\}\}(.*?)\{\{\/\1\}\}/gs, (match, key, content) => {
      return data[key] ? content : '';
    });

    // Gérer les conditions inverses {{^condition}}...{{/condition}}
    rendered = rendered.replace(/\{\{\^(\w+)\}\}(.*?)\{\{\/\1\}\}/gs, (match, key, content) => {
      return !data[key] ? content : '';
    });

    return rendered;
  }

  private buildEmail(templateName: string, config: EmailConfig, data: TemplateData): string {
    const baseTemplate = this.loadBaseTemplate();
    const contentTemplate = this.loadTemplate(templateName);
    
    // Rendre le contenu avec les données
    const renderedContent = this.renderTemplate(contentTemplate, data);
    
    // Combiner avec le template de base
    const fullData = {
      ...config,
      content: renderedContent,
      title: config.headerTitle
    };
    
    return this.renderTemplate(baseTemplate, fullData);
  }

  generateDonorThankYouEmail(donorName: string, amount: number, childName: string, packName: string): string {
    const data = {
      donorName,
      amount,
      childName,
      packName,
      date: new Date().toLocaleDateString('fr-FR')
    };

    return this.buildEmail('donor-thank-you', EMAIL_CONFIGS.donor, data);
  }

  generatePlayerNotificationEmail(playerName: string, amount: number, donorName: string, packName: string, isAnonymous: boolean): string {
    const data = {
      playerName,
      amount,
      donorName,
      packName,
      isAnonymous,
      date: new Date().toLocaleDateString('fr-FR')
    };

    return this.buildEmail('player-notification', EMAIL_CONFIGS.player, data);
  }

  generateClubNotificationEmail(clubName: string, playerName: string, amount: number, donorName: string, packName: string, isAnonymous: boolean): string {
    const data = {
      clubName,
      playerName,
      amount,
      donorName,
      packName,
      isAnonymous,
      date: new Date().toLocaleDateString('fr-FR')
    };

    return this.buildEmail('club-notification', EMAIL_CONFIGS.club, data);
  }

  generateAdminNotificationEmail(donationData: {
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
  }): string {
    const now = new Date();
    const data = {
      ...donationData,
      date: now.toLocaleDateString('fr-FR'),
      time: now.toLocaleTimeString('fr-FR')
    };

    return this.buildEmail('admin-notification', EMAIL_CONFIGS.admin, data);
  }
}

export const emailTemplateService = new EmailTemplateService();