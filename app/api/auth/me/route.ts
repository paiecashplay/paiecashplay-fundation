import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, getOAuthConfig } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  
  return NextResponse.json(user)
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !user.access_token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const formData = await request.formData()
    const photo = formData.get('photo') as File

    if (!photo) {
      return NextResponse.json({ error: 'Aucune photo fournie' }, { status: 400 })
    }

    // Créer le FormData pour l'API OAuth
    const oauthFormData = new FormData()
    oauthFormData.append('photo', photo)

    const config = getOAuthConfig()
    const response = await fetch(`${config.issuer}/api/auth/profile/photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.access_token}`
      },
      body: oauthFormData
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ 
        error: error.message || 'Erreur lors de l\'upload' 
      }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Erreur upload photo profil:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !user.access_token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const config = getOAuthConfig()
    const response = await fetch(`${config.issuer}/api/auth/profile/photo`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${user.access_token}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ 
        error: error.message || 'Erreur lors de la suppression' 
      }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Erreur suppression photo profil:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}