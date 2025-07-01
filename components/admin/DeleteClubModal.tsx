'use client';

import { X, AlertTriangle } from 'lucide-react';

interface DeleteClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  clubName: string;
  childrenCount: number;
}

export default function DeleteClubModal({ isOpen, onClose, onDelete, clubName, childrenCount }: DeleteClubModalProps) {
  if (!isOpen) return null;

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="relative p-6 border-b border-gray-100">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Supprimer le club</h2>
              <p className="text-gray-600">Cette action est irréversible</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Êtes-vous sûr de vouloir supprimer le club <strong>{clubName}</strong> ?
            </p>
            
            {childrenCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Attention</h4>
                    <p className="text-sm text-yellow-700">
                      Ce club a <strong>{childrenCount} enfant(s)</strong> inscrit(s). 
                      Ils seront également supprimés ou devront être transférés vers un autre club.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Conséquences de la suppression :</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Toutes les données du club seront perdues</li>
                <li>• Les enfants inscrits perdront leur affiliation</li>
                <li>• L'historique des dons sera conservé mais orphelin</li>
                <li>• Cette action ne peut pas être annulée</li>
              </ul>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
            >
              Supprimer définitivement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}