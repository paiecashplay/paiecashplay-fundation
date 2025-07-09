'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Heart, Home, Mail, Download, Trophy, QrCode } from 'lucide-react';
import Link from 'next/link';

interface SessionData {
  childName: string;
  packName: string;
  licenseNumber: string;
  donorEmail?: string;
}

export default function DonationSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchSessionData();
    }
  }, [sessionId]);

  const fetchSessionData = async () => {
    try {
      const response = await fetch(`/api/stripe/session?session_id=${sessionId}`);
      const data = await response.json();
      setSessionData(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLicense = () => {
    if (!sessionData?.childName) return;
    
    const element = document.createElement('a');
    const licenseContent = generateLicenseContent();
    const file = new Blob([licenseContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `licence-${sessionData.childName.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generateLicenseContent = () => {
    if (!sessionData) return '';
    
    return `
=== LICENCE OFFICIELLE PAIECASHPLAY ===

Enfant: ${sessionData.childName}
Pack: ${sessionData.packName}
Numéro de licence: ${sessionData.licenseNumber}
Date d'attribution: ${new Date().toLocaleDateString('fr-FR')}
Validité: 30/06/2025
Parrain: ${sessionData.donorEmail || 'Donateur anonyme'}

Cette licence est valide pour la saison 2024-2025.

--- PaieCashPlay - Sport Solidaire ---
    `;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4FBA73]/10 to-[#3da562]/10 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-[#4FBA73] to-[#3da562] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Merci pour votre générosité !
          </h1>
          
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Heart className="w-6 h-6 text-[#4FBA73]" />
            <p className="text-lg text-gray-600">
              Votre don a été traité avec succès
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4FBA73] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des informations...</p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="w-5 h-5 text-[#4FBA73] mr-2" />
              Prochaines étapes :
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#4FBA73] rounded-full mt-2 flex-shrink-0"></div>
                <span>Vous recevrez un reçu fiscal par email dans les prochaines minutes</span>
              </li>
              {sessionData?.childName && (
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#4FBA73] rounded-full mt-2 flex-shrink-0"></div>
                  <span>La licence de {sessionData.childName} est maintenant active</span>
                </li>
              )}
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#4FBA73] rounded-full mt-2 flex-shrink-0"></div>
                <span>Vous recevrez des mises à jour sur l&apos;impact de votre don</span>
              </li>
            </ul>
          </div>
        )}

        {/* License Card */}
        {!loading && sessionData?.childName && (
          <div className="bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] text-white p-6 rounded-xl shadow-lg mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <Trophy className="text-yellow-400 mr-2 w-5 h-5" />
                <span className="font-bold">PAIECASHPLAY</span>
              </div>
              <span className="text-sm">SAISON 2025-2026</span>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-2">🌍</span>
                <span className="text-sm">LICENCE SOLIDAIRE</span>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded flex items-center justify-center">
                <QrCode className="text-white w-6 h-6" />
              </div>
            </div>
            
            <div className="border-t border-white border-opacity-30 pt-4 mb-4">
              <h5 className="font-bold text-lg mb-2">📋 LICENCE ATTRIBUÉE</h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm opacity-75">👤 ENFANT</p>
                  <p className="font-bold">{sessionData.childName.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm opacity-75">🎁 PACK</p>
                  <p className="font-bold">{sessionData.packName}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded p-3 mb-4">
              <p className="text-center text-sm">🎆 Félicitations ! Licence attribuée avec succès</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm opacity-75">📊 N° LICENCE</p>
                <p className="font-bold">{sessionData.licenseNumber}</p>
              </div>
              <div>
                <p className="text-sm opacity-75">📅 VALIDITÉ</p>
                <p className="font-bold">30/06/2025</p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm opacity-75">💳 Sponsorisé par vous</p>
              <p className="text-xs">💫 Licence Solidaire - Merci pour votre générosité</p>
            </div>
            
            <button
              onClick={handleDownloadLicense}
              className="w-full mt-4 bg-white text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger la licence</span>
            </button>
          </div>
        )}

        <div className="bg-gradient-to-r from-[#4FBA73] to-[#3da562] rounded-xl p-6 text-white text-center mb-8">
          <Heart className="w-8 h-8 mx-auto mb-3" />
          <h3 className="font-bold text-lg mb-2">Votre impact commence maintenant</h3>
          <p className="text-green-100">
            {sessionData?.childName ? 
              `Grâce à votre générosité, ${sessionData.childName} peut maintenant pratiquer le sport avec une licence officielle !` :
              'Grâce à votre générosité, des enfants africains pourront pratiquer le sport et développer leurs talents.'
            }
          </p>
        </div>

        <Link href="/">
          <button className="w-full bg-[#4FBA73] hover:bg-[#3da562] text-white py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2">
            <Home className="w-5 h-5" />
            <span>Retour à l&apos;accueil</span>
          </button>
        </Link>
      </div>
    </div>
  );
}