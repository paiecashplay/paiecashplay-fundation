import fs from 'fs';
import path from 'path';

// Fonction pour créer le dossier d'emails si nécessaire
const createEmailsFolder = () => {
  const emailsDir = path.join(process.cwd(), 'emails');
  if (!fs.existsSync(emailsDir)) {
    fs.mkdirSync(emailsDir, { recursive: true });
  }
  return emailsDir;
};

// Fonction pour sauvegarder l'email localement
export const saveEmailLocally = async (mailOptions: any) => {
  try {
    const emailsDir = createEmailsFolder();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${timestamp}-${mailOptions.to.replace('@', '-at-')}.html`;
    const filePath = path.join(emailsDir, fileName);
    
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Email: ${mailOptions.subject}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .email-container { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
    .email-header { background-color: #f5f5f5; padding: 10px; margin-bottom: 20px; border-radius: 5px; }
    .email-content { padding: 10px; }
    .email-footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 12px; color: #777; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <p><strong>De:</strong> ${mailOptions.from}</p>
      <p><strong>À:</strong> ${mailOptions.to}</p>
      ${mailOptions.replyTo ? `<p><strong>Répondre à:</strong> ${mailOptions.replyTo}</p>` : ''}
      <p><strong>Sujet:</strong> ${mailOptions.subject}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
    </div>
    <div class="email-content">
      ${mailOptions.html}
    </div>
    <div class="email-footer">
      <p>Cet email a été sauvegardé localement car l'envoi a échoué ou est désactivé.</p>
      <p>Fichier: ${fileName}</p>
    </div>
  </div>
</body>
</html>
    `;
    
    // Ensure the directory exists before writing the file
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }
    
    fs.writeFileSync(filePath, emailContent);
    console.log(`Email sauvegardé localement: ${filePath}`);
    
    return {
      messageId: `local-${timestamp}`,
      filePath,
    };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde locale de l\'email:', error);
    throw error;
  }
};

// Fonction pour récupérer les emails sauvegardés localement
export const getLocalEmails = () => {
  try {
    const emailsDir = createEmailsFolder();
    if (!fs.existsSync(emailsDir)) {
      return [];
    }
    
    const files = fs.readdirSync(emailsDir)
      .filter(file => file.endsWith('.html'))
      .map(file => {
        const stats = fs.statSync(path.join(emailsDir, file));
        return {
          id: file.replace('.html', ''),
          filename: file,
          path: path.join(emailsDir, file),
          createdAt: stats.birthtime.toISOString(),
          size: stats.size,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return files;
  } catch (error) {
    console.error('Erreur lors de la récupération des emails locaux:', error);
    return [];
  }
};

// Fonction pour récupérer le contenu d'un email local
export const getLocalEmailContent = (filename: string) => {
  try {
    const emailsDir = createEmailsFolder();
    const filePath = path.join(emailsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Email non trouvé');
    }
    
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error('Erreur lors de la récupération du contenu de l\'email:', error);
    throw error;
  }
};