// Configuration conditionnelle pour éviter les erreurs en développement
let storage: any = null
let bucket: any = null

// Initialiser seulement si les variables sont définies
if (process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_CLIENT_EMAIL) {
  try {
    const { Storage } = require('@google-cloud/storage')
    
    storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n')
      }
    })
    
    bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET!)
  } catch (error) {
    console.warn('Google Cloud Storage non configuré:', error)
  }
}

export async function uploadFile(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  if (!bucket) {
    // Simulation pour le développement
    const mockUrl = `/uploads/${fileName}`
    console.log('Mode simulation - fichier uploadé:', mockUrl)
    return mockUrl
  }
  
  const blob = bucket.file(fileName)
  
  const stream = blob.createWriteStream({
    metadata: {
      contentType
    },
    public: true
  })

  return new Promise((resolve, reject) => {
    stream.on('error', reject)
    stream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`
      resolve(publicUrl)
    })
    stream.end(file)
  })
}

export async function deleteFile(fileName: string): Promise<void> {
  if (!bucket) {
    console.log('Mode simulation - fichier supprimé:', fileName)
    return
  }
  
  await bucket.file(fileName).delete()
}

export function generateFileName(userId: string, originalName: string, type: 'image' | 'video' | 'profile', entityType: 'player' | 'club' | 'user' = 'player'): string {
  const timestamp = Date.now()
  const extension = originalName.split('.').pop()
  
  if (type === 'profile') {
    return `${entityType}s/${userId}/profile/avatar_${timestamp}.${extension}`
  }
  
  return `${entityType}s/${userId}/${type}s/${timestamp}.${extension}`
}