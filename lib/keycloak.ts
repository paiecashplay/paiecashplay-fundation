// Configuration des URLs Keycloak

// URL de base de Keycloak (à remplacer par votre URL réelle)
const KEYCLOAK_BASE_URL = process.env.KEYCLOAK_BASE_URL || 'https://auth.paiecashplay.com';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'PaiecashPlay';
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || 'paiecashplay-fundation';

// URL de redirection après authentification
const REDIRECT_URI = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// URLs pour l'authentification
export const keycloakUrls = {
  // URL de connexion
  login: `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth?client_id=${KEYCLOAK_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${REDIRECT_URI}/api/auth/callback`)}&response_type=code&scope=openid`,
  
  // URL d'inscription
  register: `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth?client_id=${KEYCLOAK_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${REDIRECT_URI}/api/auth/callback`)}&response_type=code&scope=openid&kc_action=register`,
  
  // URL de déconnexion
  logout: `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(REDIRECT_URI)}`,
  
  // URL pour récupérer un token
  token: `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
  
  // URL pour récupérer les informations utilisateur
  userinfo: `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/userinfo`
};

// Fonction pour ajouter un rôle à un utilisateur
export async function addRoleToUser(userId: string, role: string): Promise<boolean> {
  try {
    // Cette fonction serait implémentée avec l'API Admin de Keycloak
    // Pour l'exemple, nous simulons une réussite
    console.log(`Ajout du rôle ${role} à l'utilisateur ${userId}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du rôle:', error);
    return false;
  }
}