import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeInsert } from '@/lib/database-cloudsql';
import { addRoleToUser } from '@/lib/keycloak';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userType, keycloakId, ...profileData } = body;

    // Récupérer l'ID Keycloak depuis le token
    // Dans un environnement réel, vous récupéreriez cela depuis le token d'authentification
    // Pour l'exemple, nous utilisons un ID fictif ou celui fourni
    const userId = keycloakId || 'keycloak-user-' + Math.random().toString(36).substring(2, 9);

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
    let specificProfileResult = { success: true };

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

    // Dans un environnement réel, cette partie serait active
    // Pour l'exemple, nous simulons la réussite
    let roleAdded = true;
    
    // Décommenter pour utiliser l'API Keycloak réelle
    // const roleAdded = await addRoleToUser(userId, roleMap[userType as keyof typeof roleMap]);
    
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