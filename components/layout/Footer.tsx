'use client';

import { useState } from 'react';
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaPaperPlane,
  FaRobot,
  FaTimes,
} from 'react-icons/fa';

export default function Footer() {
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const toggleAI = () => {
    setAiModalOpen(!aiModalOpen);
  };

  return (
    <>
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-[#4FBA73] rounded-full flex items-center justify-center">
                  <span className="font-bold">P</span>
                </div>
                <span className="text-xl font-bold">PaieCashPlay</span>
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
                {[
                  'License Solidaire',
                  'Champion Equipment',
                  'Daily Energy',
                  'Talent Journey',
                  "Tomorrow's Training",
                ].map((item, idx) => (
                  <li key={idx}>
                    <a href="#" className="hover:text-[#4FBA73] transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                {[
                  'Comment Donner',
                  "Rapports d'Impact",
                  'Reçus Fiscaux',
                  'Nous Contacter',
                  'FAQ',
                ].map((item, idx) => (
                  <li key={idx}>
                    <a href="#" className="hover:text-[#4FBA73] transition-colors">{item}</a>
                  </li>
                ))}
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
              © 2024 PaieCashPlay. Tous droits réservés. | Propulsé par PaieCashPlay & FFM
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