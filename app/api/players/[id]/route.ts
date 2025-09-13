import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, getOAuthConfig } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer les données du joueur depuis l'API OAuth
    const config = getOAuthConfig()
    const response = await fetch(`${config.issuer}/api/oauth/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${user.access_token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Joueur non trouvé' },
        { status: 404 }
      )
    }

    const playerOAuth = await response.json()
    
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
    
    const playerUser = playerOAuth.user
    const profile = playerUser.profile
    
    const playerData = {
      id: playerUser.id,
      firstName: profile.firstName || 'Joueur',
      lastName: profile.lastName || '',
      email: playerUser.email,
      picture: profile.avatarUrl,
      country: profile.country || 'France',
      isVerified: playerUser.isVerified || false,
      createdAt: new Date(playerUser.createdAt).toISOString(),
      metadata: {
        position: profile.metadata?.position || 'Joueur',
        height: profile.metadata?.height,
        weight: profile.metadata?.weight,
        birthDate: profile.metadata?.birthDate,
        jerseyNumber: profile.metadata?.jerseyNumber,
        bio: profile.metadata?.bio || `Joueur passionné de football.`,
        achievements: profile.metadata?.achievements || [
          'Membre actif du club',
          'Participation aux entraînements'
        ]
      },
      club: {
        id: profile.metadata?.clubId || 'club-1',
        name: profile.metadata?.clubName || 'Club de Football'
      },
      federation: {
        id: 'fed-1',
        name: 'Fédération de Football'
      },
      stats: {
        totalLicenses: donations.length,
        activeLicenses: completedDonations.length,
        totalDonationsReceived: Math.round(totalDonationsReceived)
      }
    }

    return NextResponse.json(playerData)
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
    
    const response = await fetch(`${config.issuer}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${user.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: body.firstName,
        lastName: body.lastName,
        country: body.country,
        metadata: body.metadata
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