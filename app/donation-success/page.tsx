'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Heart, Home, Share2 } from 'lucide-react'
import Link from 'next/link'

export default function DonationSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [sessionData, setSessionData] = useState<any>(null)

  useEffect(() => {
    if (sessionId) {
      // Optionnel: récupérer les détails de la session
      console.log('Session ID:', sessionId)
    }
  }, [sessionId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Success */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Merci pour votre don !</h1>
          <p className="text-green-100 text-lg">
            Votre générosité fait la différence dans la vie des enfants
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Votre don a été traité avec succès
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Grâce à votre soutien, nous pouvons continuer à offrir des opportunités sportives 
              aux jeunes footballeurs africains. Un reçu fiscal vous sera envoyé par email.
            </p>
          </div>

          {/* Impact Message */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-8 border border-green-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Impact de votre don
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Contribue directement au développement sportif des enfants</li>
              <li>• Aide à financer les équipements et licences</li>
              <li>• Soutient les programmes de formation des jeunes talents</li>
              <li>• Favorise l'inclusion sociale par le sport</li>
            </ul>
          </div>

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">Prochaines étapes</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 font-bold text-xs">1</span>
                </div>
                <p>Vous recevrez un email de confirmation dans les prochaines minutes</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 font-bold text-xs">2</span>
                </div>
                <p>Votre reçu fiscal sera disponible sous 48h</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 font-bold text-xs">3</span>
                </div>
                <p>Vous recevrez des mises à jour sur l'impact de votre contribution</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Retour à l'accueil</span>
            </Link>
            
            <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2">
              <Share2 className="w-5 h-5" />
              <span>Partager</span>
            </button>
          </div>

          {/* Footer Message */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Des questions ? Contactez-nous à{' '}
              <a href="mailto:contact@paiecashplay.com" className="text-green-600 hover:underline">
                contact@paiecashplay.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}