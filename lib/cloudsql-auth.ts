import { GoogleAuth } from 'google-auth-library';

// Configuration pour l'authentification Google Cloud
export class CloudSQLAuth {
  private auth: GoogleAuth;

  constructor() {
    this.auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      // Le fichier de clé de service sera automatiquement détecté
      // via GOOGLE_APPLICATION_CREDENTIALS ou les métadonnées d'instance
    });
  }

  // Obtenir un token d'accès pour Cloud SQL
  async getAccessToken(): Promise<string> {
    try {
      const client = await this.auth.getClient();
      const accessToken = await client.getAccessToken();
      return accessToken.token || '';
    } catch (error) {
      console.error('Erreur obtention token Cloud SQL:', error);
      throw error;
    }
  }

  // Vérifier l'authentification
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const cloudSQLAuth = new CloudSQLAuth();