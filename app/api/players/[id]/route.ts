import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, getOAuthConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Récupérer les données du joueur depuis l'API OAuth publique
    const config = getOAuthConfig()
    const response = await fetch(`${config.issuer}/api/public/players/${id}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Joueur non trouvé' },
        { status: 404 }
      )
    }

    const playerData = await response.json()
    console.log('Données joueur OAuth:', playerData)
    
    // Récupérer les donations depuis la base de données locale
    const donations = await prisma.donation.findMany({
      where: {
        joueur: {
          oauth_id: id
        }
      },
      select: {
        montant: true,
        statut: true
      }
    })

    // Calculer les statistiques
    const completedDonations = donations.filter(d => d.statut === 'completed')
    const totalDonationsReceived = completedDonations.reduce((sum, d) => sum + Number(d.montant), 0)
    
    // Calculer l'âge
    let age = 18
    if (playerData.age) {
      age = playerData.age
    } else if (playerData.dateOfBirth) {
      const birthDate = new Date(playerData.dateOfBirth)
      const today = new Date()
      age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
    }
    
    const formattedPlayerData = {
      id: playerData.id,
      firstName: playerData.firstName || 'Joueur',
      lastName: playerData.lastName || '',
      email: playerData.email,
      phone: playerData.phone,
      picture: playerData.avatarUrl,
      country: playerData.country || 'France',
      language: playerData.language,
      isVerified: playerData.isVerified || false,
      isActive: playerData.isActive,
      createdAt: playerData.createdAt,
      updatedAt: playerData.updatedAt,
      age: age,
      position: playerData.position,
      height: playerData.height,
      weight: playerData.weight,
      status: playerData.status || 'active',
      preferredFoot: playerData.preferredFoot,
      jerseyNumber: playerData.jerseyNumber,
      previousClubs: playerData.previousClubs || [],
      achievements: playerData.achievements || [],
      injuries: playerData.injuries || [],
      notes: playerData.notes,
      contractStatus: playerData.contractStatus,
      club: {
        id: playerData.club?.id,
        name: playerData.club?.name || 'Club non renseigné',
        country: playerData.club?.country,
        federation: playerData.club?.federation,
        email: playerData.club?.email,
        phone: playerData.club?.phone,
        website: playerData.club?.website,
        address: playerData.club?.address,
        foundedYear: playerData.club?.foundedYear,
        description: playerData.club?.description,
        isVerified: playerData.club?.isVerified
      },
      stats: {
        totalLicenses: donations.length,
        activeLicenses: completedDonations.length,
        totalDonationsReceived: Math.round(totalDonationsReceived)
      }
    }

    return NextResponse.json(formattedPlayerData)
  } catch (error) {
    console.error('Erreur API joueur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    const { id } = await params
    const body = await request.json()

    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur peut modifier ce profil
    let canEdit = false
    
    if (user.sub === id) {
      // L'utilisateur modifie son propre profil
      canEdit = true
    } else if (user.user_type === 'club') {
      // Vérifier si le joueur est membre du club
      try {
        const config = getOAuthConfig()
        const membersResponse = await fetch(`${config.issuer}/api/oauth/clubs/${user.sub}/members`, {
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (membersResponse.ok) {
          const membersResult = await membersResponse.json()
          const members = membersResult.members || []
          canEdit = members.some((member: any) => member.id === id)
        }
      } catch (error) {
        console.error('Erreur vérification membre:', error)
      }
    }
    
    if (!canEdit) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Mettre à jour via l'API OAuth
    const config = getOAuthConfig()
    
    // Si c'est un club qui modifie, utiliser l'endpoint spécifique
    const endpoint = user.user_type === 'club' && user.sub !== id
      ? `/api/oauth/clubs/${user.sub}/members/${id}`
      : '/api/auth/profile'
    
    // Gérer le changement de club si nécessaire
    if (body.club && body.club.id) {
      try {
        // Ajouter le joueur au nouveau club
        const addMemberResponse = await fetch(`${config.issuer}/api/oauth/clubs/${body.club.id}/members`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            playerId: id,
            role: 'player'
          })
        })
        
        if (!addMemberResponse.ok) {
          console.warn('Erreur ajout au club:', await addMemberResponse.text())
        }
      } catch (error) {
        console.error('Erreur gestion club:', error)
      }
    }
    
    const response = await fetch(`${config.issuer}/api/oauth/players/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${user.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        country: body.country,
        height: body.height,
        weight: body.weight,
        metadata: {
          position: body.metadata?.position,
          preferredFoot: body.metadata?.preferredFoot,
          jerseyNumber: body.metadata?.jerseyNumber,
          notes: body.metadata?.notes,
          club: body.metadata?.club
        }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.message || 'Erreur lors de la mise à jour' },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json({ success: true, player: result.profile })
  } catch (error) {
    console.error('Erreur mise à jour joueur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}