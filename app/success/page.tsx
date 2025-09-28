'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Check, Heart, Gift } from 'lucide-react';
import Link from 'next/link';

interface DonationInfo {
  id: string;
  montant: number;
  pack_nom: string;
  type_recurrence: string;
  joueur: {
    prenom: string;
    nom: string;
    photo_emoji: string;
    club_nom: string;
    pays_nom: string;
  };
  is_anonymous: boolean;
  date_paiement: string;
}

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [donationInfo, setDonationInfo] = useState<DonationInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchDonationInfo(sessionId);
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const fetchDonationInfo = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/stripe/success?session_id=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setDonationInfo(data);
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Header />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4FBA73]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Merci pour votre générosité ! 🎉
          </h1>
          <p className="text-xl text-gray-600">
            Votre don a été traité avec succès
          </p>
        </div>

        {donationInfo && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-[#4FBA73] to-[#3da562] p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center">
                <Gift className="w-6 h-6 mr-3" />
                Récapitulatif de votre don
              </h2>
            </div>
            
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails du don</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pack choisi :</span>
                      <span className="font-medium">{donationInfo.pack_nom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Montant :</span>
                      <span className="font-bold text-[#4FBA73] text-xl">
                        {donationInfo.montant}€
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Enfant soutenu</h3>
                  <div className="bg-gradient-to-r from-[#4FBA73]/10 to-[#3da562]/10 rounded-xl p-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-4xl">{donationInfo.joueur.photo_emoji}</span>
                      <div>
                        <h4 className="font-bold text-lg text-[#4FBA73]">
                          {donationInfo.joueur.prenom} {donationInfo.joueur.nom}
                        </h4>
                        <p className="text-gray-600">{donationInfo.joueur.club_nom}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center">
            <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Merci de la part de toute l'équipe PaieCashPlay !
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Votre soutien contribue directement à l'épanouissement des jeunes talents africains.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link 
            href="/" 
            className="inline-block bg-[#4FBA73] text-white px-8 py-3 rounded-lg hover:bg-[#3da562] transition-colors font-semibold"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}