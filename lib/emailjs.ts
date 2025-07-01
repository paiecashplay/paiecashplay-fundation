import emailjs from '@emailjs/browser';

// Configuration des IDs EmailJS depuis les variables d'environnement
const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_paiecash';
const CONTACT_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID || 'template_contact';
const NEWSLETTER_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_NEWSLETTER_TEMPLATE_ID || 'template_newsletter';
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

// Initialisation d'EmailJS (seulement côté client)
if (typeof window !== 'undefined') {
  emailjs.init(PUBLIC_KEY);
}

// Interface pour le formulaire de contact
interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  source: string;
  solutions: {
    paiecashcard: boolean;
    paiecashstream: boolean;
    paiecashbot: boolean;
    paiecashstore: boolean;
  };
  message: string;
}

// Interface pour la newsletter
interface NewsletterData {
  email: string;
}

// Fonction pour envoyer un message de contact
export const sendContactForm = async (data: ContactFormData) => {
  // Vérifier si on est côté client
  if (typeof window === 'undefined') {
    console.log('Tentative d\'envoi d\'email côté serveur, utilisation du système de sauvegarde');
    // Utiliser le système de sauvegarde locale
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde locale:', error);
      throw new Error('Impossible d\'envoyer l\'email ou de le sauvegarder localement');
    }
  }

  // Formatage des solutions sélectionnées
  const selectedSolutions = Object.entries(data.solutions)
    .filter(([_, selected]) => selected)
    .map(([key]) => {
      switch (key) {
        case 'paiecashcard': return 'PaieCashCard';
        case 'paiecashstream': return 'PaieCashStream';
        case 'paiecashbot': return 'PaieCashBot';
        case 'paiecashstore': return 'PaieCashStore';
        default: return key;
      }
    })
    .join(', ');

  // Formatage de la source
  const sourceMap: Record<string, string> = {
    search: 'Moteur de recherche',
    social: 'Réseaux sociaux',
    recommendation: 'Recommandation',
    event: 'Événement',
    other: 'Autre',
  };

  // Préparation des données pour EmailJS
  const templateParams = {
    from_name: data.name,
    from_email: data.email,
    phone: data.phone,
    company: data.company || 'Non spécifié',
    source: sourceMap[data.source] || data.source,
    solutions: selectedSolutions || 'Aucune solution spécifique sélectionnée',
    message: data.message,
    reply_to: data.email,
  };

  try {
    // Envoi du message via EmailJS
    const response = await emailjs.send(SERVICE_ID, CONTACT_TEMPLATE_ID, templateParams);
    console.log('Email envoyé avec succès:', response);
    return response;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    // Utiliser le système de sauvegarde locale si disponible
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Échec de la sauvegarde locale');
      }
      
      throw new Error('EmailJS: Échec de l\'envoi, mais sauvegardé localement');
    } catch (backupError) {
      console.error('Erreur lors de la sauvegarde locale:', backupError);
      throw error; // Rethrow the original error
    }
  }
};

// Fonction pour envoyer une inscription à la newsletter
export const sendNewsletterSubscription = async (data: NewsletterData) => {
  // Vérifier si on est côté client
  if (typeof window === 'undefined') {
    console.log('Tentative d\'envoi d\'email côté serveur, utilisation du système de sauvegarde');
    // Utiliser le système de sauvegarde locale
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde locale:', error);
      throw new Error('Impossible d\'envoyer l\'email ou de le sauvegarder localement');
    }
  }

  // Préparation des données pour EmailJS
  const templateParams = {
    subscriber_email: data.email,
    subscription_date: new Date().toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  try {
    // Envoi de l'inscription via EmailJS
    const response = await emailjs.send(SERVICE_ID, NEWSLETTER_TEMPLATE_ID, templateParams);
    console.log('Inscription newsletter envoyée avec succès:', response);
    return response;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'inscription newsletter:', error);
    // Utiliser le système de sauvegarde locale si disponible
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Échec de la sauvegarde locale');
      }
      
      throw new Error('EmailJS: Échec de l\'envoi, mais sauvegardé localement');
    } catch (backupError) {
      console.error('Erreur lors de la sauvegarde locale:', backupError);
      throw error; // Rethrow the original error
    }
  }
};