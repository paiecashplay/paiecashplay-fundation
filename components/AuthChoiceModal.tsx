'use client';

import { useState } from 'react';
import { X, LogIn, Heart, User, Gift } from 'lucide-react';

interface AuthChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onAnonymous: () => void;
  packName: string;
  childName: string;
  amount: number;
}

export default function AuthChoiceModal({ 
  isOpen, 
  onClose, 
  onLogin, 
  onAnonymous, 
  packName, 
  childName, 
  amount 
}: AuthChoiceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="relative p-6 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#4FBA73] to-[#3da562] rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Finaliser votre don</h2>
            <p className="text-gray-600">
              {packName} pour <span className="font-semibold">{childName}</span>
            </p>
            <p className="text-2xl font-bold text-[#4FBA73] mt-2">{amount}€</p>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 text-center mb-6">
            Comment souhaitez-vous procéder à votre don ?
          </p>

          <div className="space-y-4">
            {/* Option Connexion */}
            <button
              onClick={onLogin}
              className="w-full p-4 border-2 border-[#4FBA73] rounded-xl hover:bg-[#4FBA73]/5 transition-colors group"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#4FBA73]/10 rounded-full flex items-center justify-center mr-4 group-hover:bg-[#4FBA73]/20 transition-colors">
                  <LogIn className="w-6 h-6 text-[#4FBA73]" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-gray-900">Me connecter</h3>
                  <p className="text-sm text-gray-600">
                    Suivre mes donations et recevoir des mises à jour
                  </p>
                </div>
              </div>
            </button>

            {/* Option Anonyme */}
            <button
              onClick={onAnonymous}
              className="w-full p-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-gray-200 transition-colors">
                  <Heart className="w-6 h-6 text-gray-600" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-gray-900">Don anonyme</h3>
                  <p className="text-sm text-gray-600">
                    Faire un don sans créer de compte
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <div className="flex items-start">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-white text-xs">i</span>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Pourquoi se connecter ?</p>
                <ul className="text-xs space-y-1">
                  <li>• Suivi de vos donations</li>
                  <li>• Reçu fiscal automatique</li>
                  <li>• Mises à jour sur l'enfant soutenu</li>
                  <li>• Accès au mur des champions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}