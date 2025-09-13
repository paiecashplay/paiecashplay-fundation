'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { useToastContext } from '@/components/ToastProvider';

interface ProfilePictureUploadProps {
  userId: string;
  currentPicture?: string;
  onPictureUpdate: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProfilePictureUpload({ 
  userId, 
  currentPicture, 
  onPictureUpdate, 
  size = 'md' 
}: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToastContext();

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Erreur', 'Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Fichier trop volumineux', 'Maximum 5MB pour les photos de profil');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('photo', file);

      // Simulation de progression plus réaliste
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 30) return prev + 15; // Démarrage rapide
          if (prev < 60) return prev + 8;  // Ralentissement
          if (prev < 85) return prev + 3;  // Plus lent
          return Math.min(prev + 1, 90);   // Très lent à la fin
        });
      }, 150);

      const response = await fetch('/api/auth/me', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        
        // Animation de complétion
        setUploadProgress(100);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mettre à jour directement avec l'URL reçue
        onPictureUpdate(result.picture);
        toast.success('Photo mise à jour', 'Votre photo de profil a été mise à jour avec succès');
      } else {
        const error = await response.json();
        toast.error('Erreur d\'upload', error.error || 'Erreur inconnue');
      }
    } catch (error) {
      toast.error('Erreur d\'upload', 'Une erreur est survenue lors de l\'upload');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="relative group">
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-[#4FBA73] to-[#3da562] flex items-center justify-center relative`}>
        {currentPicture ? (
          <img
            src={currentPicture}
            alt="Photo de profil"
            className="w-full h-full object-cover"
            key={currentPicture} // Force le re-render quand l'URL change
          />
        ) : (
          <span className="text-white text-4xl font-bold">
            {userId ? userId.charAt(0).toUpperCase() : '?'}
          </span>
        )}

        {/* Overlay d'upload */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          uploading 
            ? 'bg-black/70 opacity-100' 
            : 'bg-black/50 opacity-0 group-hover:opacity-100'
        }`}>
          {uploading ? (
            <div className="text-center">
              <div className="relative mb-3">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{uploadProgress}%</span>
                </div>
              </div>
              <div className="w-20 bg-white/20 rounded-full h-2 mb-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-white text-xs font-medium">
                {uploadProgress < 90 ? 'Upload en cours...' : 'Finalisation...'}
              </p>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-all duration-200 hover:scale-110"
              title="Changer la photo de profil"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        className="hidden"
      />
    </div>
  );
}