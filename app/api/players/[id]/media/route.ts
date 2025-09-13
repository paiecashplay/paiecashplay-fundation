import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadFile, deleteFile, generateFileName } from '@/lib/storage'

// Limites de taille (en bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    const { id } = await params

    if (!user || user.sub !== id) {
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

    // Vérifier la taille
    const maxSize = type === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `Fichier trop volumineux. Maximum ${maxSize / 1024 / 1024}MB` 
      }, { status: 400 })
    }

    // Vérifier le type MIME
    const allowedTypes = type === 'image' 
      ? ['image/jpeg', 'image/png', 'image/webp']
      : ['video/mp4', 'video/webm', 'video/quicktime']
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Type de fichier non supporté: ${file.type}` 
      }, { status: 400 })
    }

    // Upload vers Google Cloud Storage
    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = generateFileName(id, file.name, type, 'player')
    const url = await uploadFile(buffer, fileName, file.type)

    // Sauvegarder en base de données
    const media = await prisma.playerMedia.create({
      data: {
        playerId: id,
        type,
        url,
        fileName,
        title: title || file.name,
        description: description || null,
        fileSize: file.size,
        mimeType: file.type
      }
    })

    return NextResponse.json({ success: true, media })
  } catch (error) {
    console.error('Erreur upload média:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Récupérer les médias depuis la base de données
    const media = await prisma.playerMedia.findMany({
      where: { playerId: id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error('Erreur récupération médias:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('mediaId')

    if (!user || user.sub !== id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    if (!mediaId) {
      return NextResponse.json({ error: 'ID média requis' }, { status: 400 })
    }

    const media = await prisma.playerMedia.findUnique({
      where: { id: mediaId }
    })

    if (!media || media.playerId !== id) {
      return NextResponse.json({ error: 'Média non trouvé' }, { status: 404 })
    }

    // Supprimer de Google Cloud Storage
    await deleteFile(media.fileName)

    // Supprimer de la base de données
    await prisma.playerMedia.delete({
      where: { id: mediaId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur suppression média:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}