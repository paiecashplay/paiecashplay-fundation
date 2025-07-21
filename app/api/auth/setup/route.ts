import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeInsert, QueryResult } from '@/lib/database-cloudsql';
import { addRoleToUser } from '@/lib/keycloak-admin';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userType, keycloakId, ...profileData } = body;

    // Récupérer le token d'accès depuis le cookie
    const accessToken = request.cookies.get('access_token')?.value;
    
    if (!accessToken && !keycloakId) {
      return NextResponse.json({ 
        error: 'Non authentifié' 
      }, { status: 401 });
    }
    
    // Récupérer l'ID Keycloak depuis le token ou utiliser celui fourni
    let userId = keycloakId;
    
    if (accessToken && !userId) {
      try {
        const userInfoEndpoint = `${process.env.KEYCLOAK_BASE_URL || 'https://auth.paiecashplay.com'}/realms/${process.env.KEYCLOAK_REALM || 'PaiecashPlay'}/protocol/openid-connect/userinfo`;
        const userInfoResponse = await fetch(userInfoEndpoint, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json();
          userId = userInfo.sub;
        }
      } catch (error) {
        console.error('Erreur récupération userinfo:', error);
      }
    }
    
    // Si toujours pas d'ID, générer un ID fictif (uniquement pour le développement)
    if (!userId) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ 
          error: 'Impossible d\'identifier l\'utilisateur' 
        }, { status: 401 });
      }
      userId = 'dev-user-' + Math.random().toString(36).substring(2, 9);
    }

    if (!userType) {
      return NextResponse.json({ error: 'Type de compte requis' }, { status: 400 });
    }

    // 1. Créer le profil utilisateur de base
    const userProfileId = uuidv4();
    
    const profileResult = await executeInsert(
      'INSERT INTO user_profiles (id, keycloak_id, user_type, phone, address, bio) VALUES (?, ?, ?, ?, ?, ?)',
      [
        userProfileId,
        userId,
        userType,
        profileData.phone || null,
        profileData.address || null,
        profileData.bio || profileData.description || null
      ]
    );

    if (!profileResult.success) {
      return NextResponse.json({ error: 'Erreur création profil', details: profileResult.error }, { status: 500 });
    }

    // 2. Créer le profil spécifique selon le type
    let specificProfileResult: QueryResult = { success: true };

    switch (userType) {
      case 'federation':
        specificProfileResult = await executeInsert(
          `INSERT INTO federation_profiles (
            id, user_profile_id, federation_code, president_name, 
            website, official_email, phone, address, description
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            userProfileId,
            profileData.federationCode,
            profileData.presidentName || null,
            profileData.website || null,
            profileData.officialEmail || null,
            profileData.phone || null,
            profileData.address || null,
            profileData.description || null
          ]
        );
        break;

      case 'club':
        specificProfileResult = await executeInsert(
          `INSERT INTO club_profiles (
            id, user_profile_id, club_code, president_name, coach_name,
            founded_year, website, official_email, phone, address, description, federation_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            userProfileId,
            profileData.clubCode,
            profileData.presidentName || null,
            profileData.coachName || null,
            profileData.foundedYear || null,
            profileData.website || null,
            profileData.officialEmail || null,
            profileData.phone || null,
            profileData.address || null,
            profileData.description || null,
            profileData.federationId || null
          ]
        );
        break;

      case 'player':
        specificProfileResult = await executeInsert(
          `INSERT INTO player_profiles (
            id, user_profile_id, player_number, position, 
            date_of_birth, nationality, club_id, parent_contact
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            userProfileId,
            profileData.playerNumber || null,
            profileData.position || null,
            profileData.dateOfBirth || null,
            profileData.nationality || null,
            profileData.clubId || null,
            profileData.parentContact || null
          ]
        );
        break;
    }

    if (!specificProfileResult.success) {
      return NextResponse.json({ 
        error: 'Erreur création profil spécifique', 
        details: specificProfileResult.error 
      }, { status: 500 });
    }

    // 3. Ajouter le rôle Keycloak
    const roleMap = {
      normal: 'user',
      federation: 'federation',
      club: 'club',
      player: 'player'
    };

    // Ajouter le rôle à l'utilisateur dans Keycloak
    let roleAdded = false;
    
    try {
      roleAdded = await addRoleToUser(userId, roleMap[userType as keyof typeof roleMap]);
    } catch (error) {
      console.error('Erreur ajout rôle:', error);
      // Continuer même si l'ajout du rôle échoue
      roleAdded = false;
    }
    
    if (!roleAdded) {
      console.warn('Erreur ajout rôle Keycloak, mais profil créé');
    }

    return NextResponse.json({ 
      success: true, 
      userProfileId,
      message: 'Compte configuré avec succès'
    });

  } catch (error: any) {
    console.error('Erreur setup compte:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur', 
      details: error.message 
    }, { status: 500 });
  }
}