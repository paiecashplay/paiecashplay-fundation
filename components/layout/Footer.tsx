'use client';

import { useState, useEffect } from 'react';
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaPaperPlane,
  FaRobot,
  FaTimes,
} from 'react-icons/fa';

interface DonationPack {
  id: string;
  nom: string;
  code: string;
  prix: number;
}

export default function Footer() {
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [donationPacks, setDonationPacks] = useState<DonationPack[]>([]);

  useEffect(() => {
    fetchDonationPacks();
  }, []);

  const fetchDonationPacks = async () => {
    try {
      const response = await fetch('/api/donations');
      const result = await response.json();
      
      if (result.success) {
        setDonationPacks(result.data || []);
      } else {
        // Fallback avec des packs par défaut
        setDonationPacks([
          { id: '1', nom: 'License Solidaire', code: 'LS', prix: 25 },
          { id: '2', nom: 'Champion Equipment', code: 'CE', prix: 50 },
          { id: '3', nom: 'Daily Energy', code: 'DE', prix: 15 },
          { id: '4', nom: 'Talent Journey', code: 'TJ', prix: 75 },
          { id: '5', nom: "Tomorrow's Training", code: 'TT', prix: 100 }
        ]);
      }
    } catch (error) {
      console.error('Erreur chargement packs:', error);
      // Fallback avec des packs par défaut
      setDonationPacks([
        { id: '1', nom: 'License Solidaire', code: 'LS', prix: 25 },
        { id: '2', nom: 'Champion Equipment', code: 'CE', prix: 50 },
        { id: '3', nom: 'Daily Energy', code: 'DE', prix: 15 },
        { id: '4', nom: 'Talent Journey', code: 'TJ', prix: 75 },
        { id: '5', nom: "Tomorrow's Training", code: 'TT', prix: 100 }
      ]);
    }
  };

  const toggleAI = () => {
    setAiModalOpen(!aiModalOpen);
  };

  const scrollToDonationPacks = () => {
    const donationSection = document.getElementById('donation-packs');
    if (donationSection) {
      donationSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <img
                  src="/logo-nobg.svg"
                  alt="PaieCashPlay Logo"
                  className="w-32 object-contain"
                />
              </div>
              <p className="text-gray-400 mb-4">
                Soutenir les enfants africains à travers le football - un don à la fois.
              </p>
              <div className="flex space-x-4">
                <FaFacebook className="text-xl text-gray-400 hover:text-[#4FBA73] cursor-pointer transition-colors" />
                <FaTwitter className="text-xl text-gray-400 hover:text-[#4FBA73] cursor-pointer transition-colors" />
                <FaInstagram className="text-xl text-gray-400 hover:text-[#4FBA73] cursor-pointer transition-colors" />
                <FaYoutube className="text-xl text-gray-400 hover:text-[#4FBA73] cursor-pointer transition-colors" />
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Packs de Dons</h4>
              <ul className="space-y-2 text-gray-400">
                {donationPacks.length > 0 ? (
                  donationPacks.map((pack) => (
                    <li key={pack.id}>
                      <button 
                        onClick={scrollToDonationPacks}
                        className="hover:text-[#4FBA73] transition-colors text-left"
                      >
                        {pack.nom}
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">Chargement des packs...</li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button 
                    onClick={scrollToDonationPacks}
                    className="hover:text-[#4FBA73] transition-colors text-left"
                  >
                    Comment Donner
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Newsletter</h4>
              <p className="text-gray-400 mb-4">
                Suivez-nous pour des mises à jour sur l'impact et les histoires de succès.
              </p>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73] outline-none"
                />
                <button className="bg-[#4FBA73] text-white px-4 py-2 rounded-lg hover:bg-[#3da562] transition-colors">
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 PaieCashPlay. Tous droits réservés. | Propulsé par PaieCashPlay & FFM
            </p>
          </div>
        </div>
      </footer>

      <div
        className="fixed bottom-6 right-6 bg-[#4FBA73] text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-[#3da562] transition-colors z-50"
        onClick={toggleAI}
      >
        <FaRobot className="text-2xl" />
      </div>

      {aiModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 m-4 max-w-md w-full relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Assistant IA PaieCash</h3>
              <button onClick={toggleAI} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
            <div className="space-y-3 mb-4">
              <div className="bg-gray-100 p-3 rounded">
                <div className="text-sm">
                  👋 Bonjour ! Comment puis-je vous aider avec vos dons aujourd'hui ?
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button className="bg-blue-100 text-blue-600 p-3 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                Comment faire un don ?
              </button>
              <button className="bg-[#4FBA73]/10 text-[#4FBA73] p-3 rounded-lg text-sm hover:bg-[#4FBA73]/20 transition-colors">
                Voir les rapports d'impact
              </button>
              <button className="bg-orange-100 text-orange-600 p-3 rounded-lg text-sm hover:bg-orange-200 transition-colors">
                Meilleur pack de don ?
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}