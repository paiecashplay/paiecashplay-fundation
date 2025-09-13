import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadFile, deleteFile, generateFileName } from '@/lib/storage'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.user_type !== 'club') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as 'image' | 'video'
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    const maxSize = type === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `Fichier trop volumineux. Maximum ${maxSize / 1024 / 1024}MB` 
      }, { status: 400 })
    }

    const allowedTypes = type === 'image' 
      ? ['image/jpeg', 'image/png', 'image/webp']
      : ['video/mp4', 'video/webm', 'video/quicktime']
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Type de fichier non supporté: ${file.type}` 
      }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = generateFileName(user.sub, file.name, type, 'club')
    const url = await uploadFile(buffer, fileName, file.type)

    // Créer un modèle ClubMedia si nécessaire ou utiliser une table générique
    const media = {
      id: Date.now().toString(),
      clubId: user.sub,
      type,
      url,
      fileName,
      title: title || file.name,
      description: description || null,
      fileSize: file.size,
      mimeType: file.type,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({ success: true, media })
  } catch (error) {
    console.error('Erreur upload média club:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.user_type !== 'club') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Pour l'instant, retourner un tableau vide
    // À implémenter avec un modèle ClubMedia si nécessaire
    const media: any[] = []

    return NextResponse.json(media)
  } catch (error) {
    console.error('Erreur récupération médias club:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('mediaId')

    if (!user || user.user_type !== 'club') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    if (!mediaId) {
      return NextResponse.json({ error: 'ID média requis' }, { status: 400 })
    }

    // À implémenter avec la suppression du stockage et de la BD
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur suppression média club:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}