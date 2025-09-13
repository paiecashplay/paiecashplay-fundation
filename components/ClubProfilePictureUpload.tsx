'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Building } from 'lucide-react';
import { useToastContext } from '@/components/ToastProvider';

interface ClubProfilePictureUploadProps {
  currentPicture?: string;
  onPictureUpdate: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
  clubName: string;
}

export default function ClubProfilePictureUpload({ 
  currentPicture, 
  onPictureUpdate, 
  size = 'md',
  clubName
}: ClubProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToastContext();

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
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
      formData.append('file', file);
      formData.append('type', 'profile');

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Simulation d'upload - remplacer par vraie API
      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        const mockUrl = URL.createObjectURL(file);
        onPictureUpdate(mockUrl);
        toast.success('Photo mise à jour', 'Photo de profil mise à jour avec succès');
        setUploading(false);
        setUploadProgress(0);
      }, 2000);

    } catch (error) {
      toast.error('Erreur d\'upload', 'Une erreur est survenue lors de l\'upload');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="relative group">
      <div className={`${sizeClasses[size]} rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center relative`}>
        {currentPicture ? (
          <img
            src={currentPicture}
            alt="Photo de profil"
            className="w-full h-full object-cover"
          />
        ) : (
          <Building className="w-10 h-10 text-white" />
        )}

        {/* Overlay d'upload */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {uploading ? (
            <div className="text-center">
              <Upload className="w-6 h-6 text-white animate-bounce mx-auto mb-2" />
              <div className="w-16 bg-white/20 rounded-full h-1">
                <div 
                  className="bg-white h-1 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
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