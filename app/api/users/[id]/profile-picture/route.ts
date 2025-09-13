import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { uploadFile, generateFileName } from '@/lib/storage'

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

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Vérifier que c'est une image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Seules les images sont autorisées' }, { status: 400 })
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop volumineux. Maximum 5MB' }, { status: 400 })
    }

    // Upload vers le stockage
    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = generateFileName(id, file.name, 'profile', 'user')
    const url = await uploadFile(buffer, fileName, file.type)

    return NextResponse.json({ success: true, url })
  } catch (error) {
    console.error('Erreur upload photo de profil:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}