// Fonctions d'administration Keycloak

import { keycloakUrls } from './keycloak';

// Interface pour le token d'administration
interface AdminToken {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  'not-before-policy': number;
  scope: string;
}

// Récupérer un token d'administration
async function getAdminToken(): Promise<string | null> {
  try {
    const tokenEndpoint = `${process.env.KEYCLOAK_BASE_URL || 'https://auth.paiecashplay.com'}/realms/master/protocol/openid-connect/token`;
    
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: 'admin-cli',
        username: process.env.KEYCLOAK_ADMIN_USERNAME || 'admin',
        password: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin'
      })
    });

    if (!response.ok) {
      console.error('Erreur récupération token admin:', await response.text());
      return null;
    }

    const tokenData: AdminToken = await response.json();
    return tokenData.access_token;
  } catch (error) {
    console.error('Erreur récupération token admin:', error);
    return null;
  }
}

// Ajouter un rôle à un utilisateur
export async function addRoleToUser(userId: string, role: string): Promise<boolean> {
  try {
    const adminToken = await getAdminToken();
    
    if (!adminToken) {
      console.error('Impossible de récupérer le token admin');
      return false;
    }

    const realmName = process.env.KEYCLOAK_REALM || 'PaiecashPlay';
    const roleEndpoint = `${process.env.KEYCLOAK_BASE_URL || 'https://auth.paiecashplay.com'}/admin/realms/${realmName}/users/${userId}/role-mappings/realm`;
    
    // Récupérer l'ID du rôle
    const rolesEndpoint = `${process.env.KEYCLOAK_BASE_URL || 'https://auth.paiecashplay.com'}/admin/realms/${realmName}/roles/${role}`;
    
    const roleResponse = await fetch(rolesEndpoint, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });

    if (!roleResponse.ok) {
      console.error('Erreur récupération rôle:', await roleResponse.text());
      return false;
    }

    const roleData = await roleResponse.json();
    
    // Ajouter le rôle à l'utilisateur
    const addRoleResponse = await fetch(roleEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        id: roleData.id,
        name: roleData.name
      }])
    });

    if (!addRoleResponse.ok) {
      console.error('Erreur ajout rôle:', await addRoleResponse.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur ajout rôle:', error);
    return false;
  }
}

// Vérifier si un utilisateur existe
export async function userExists(email: string): Promise<boolean> {
  try {
    const adminToken = await getAdminToken();
    
    if (!adminToken) {
      console.error('Impossible de récupérer le token admin');
      return false;
    }

    const realmName = process.env.KEYCLOAK_REALM || 'PaiecashPlay';
    const usersEndpoint = `${process.env.KEYCLOAK_BASE_URL || 'https://auth.paiecashplay.com'}/admin/realms/${realmName}/users?email=${encodeURIComponent(email)}`;
    
    const response = await fetch(usersEndpoint, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });

    if (!response.ok) {
      console.error('Erreur vérification utilisateur:', await response.text());
      return false;
    }

    const users = await response.json();
    return users.length > 0;
  } catch (error) {
    console.error('Erreur vérification utilisateur:', error);
    return false;
  }
}