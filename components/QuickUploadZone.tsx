'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Image as ImageIcon, Video, User, Building } from 'lucide-react';
import { useToastContext } from '@/components/ToastProvider';

interface QuickUploadZoneProps {
  entityId?: string;
  entityType: 'player' | 'club' | 'user';
  uploadType: 'media' | 'profile';
  onUploadSuccess?: (url?: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function QuickUploadZone({
  entityId,
  entityType,
  uploadType,
  onUploadSuccess,
  className = '',
  size = 'md',
  showLabel = true
}: QuickUploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToastContext();

  const sizeClasses = {
    sm: 'p-4 min-h-[80px]',
    md: 'p-6 min-h-[120px]',
    lg: 'p-8 min-h-[160px]'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const getApiEndpoint = () => {
    if (uploadType === 'profile') {
      switch (entityType) {
        case 'player':
        case 'user':
          return `/api/users/${entityId}/profile-picture`;
        case 'club':
          return '/api/club/profile-picture';
      }
    } else {
      switch (entityType) {
        case 'player':
          return `/api/players/${entityId}/media`;
        case 'club':
          return '/api/club/media';
        case 'user':
          return `/api/users/${entityId}/media`;
      }
    }
  };

  const getAcceptedTypes = () => {
    return uploadType === 'profile' ? 'image/*' : 'image/*,video/*';
  };

  const getMaxSize = () => {
    return uploadType === 'profile' ? 5 : 50; // MB
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSize = getMaxSize() * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error('Fichier trop volumineux', `Maximum ${getMaxSize()}MB`);
      return;
    }

    if (uploadType === 'profile' && !file.type.startsWith('image/')) {
      toast.error('Type de fichier invalide', 'Seules les images sont autorisées pour les photos de profil');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      
      if (uploadType === 'media') {
        const type = file.type.startsWith('image/') ? 'image' : 'video';
        formData.append('type', type);
        formData.append('title', file.name);
      }

      const response = await fetch(getApiEndpoint(), {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        
        if (uploadType === 'profile') {
          toast.success('Photo de profil mise à jour', 'Votre photo a été mise à jour avec succès');
          onUploadSuccess?.(result.url);
        } else {
          toast.success('Média ajouté', 'Votre fichier a été ajouté avec succès');
          onUploadSuccess?.();
        }
      } else {
        const error = await response.json();
        toast.error('Erreur d\'upload', error.error || 'Une erreur est survenue');
      }
    } catch (error) {
      toast.error('Erreur d\'upload', 'Une erreur est survenue lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const getIcon = () => {
    if (uploadType === 'profile') {
      switch (entityType) {
        case 'club':
          return <Building className={iconSizes[size]} />;
        default:
          return <User className={iconSizes[size]} />;
      }
    } else {
      return <ImageIcon className={iconSizes[size]} />;
    }
  };

  const getTitle = () => {
    if (uploadType === 'profile') {
      switch (entityType) {
        case 'club':
          return 'Photo de profil du club';
        case 'player':
          return 'Photo de profil du joueur';
        default:
          return 'Photo de profil';
      }
    } else {
      return 'Photos et vidéos';
    }
  };

  const getDescription = () => {
    if (uploadType === 'profile') {
      return 'Cliquez ou glissez une image ici (max 5MB)';
    } else {
      return 'Cliquez ou glissez vos photos/vidéos ici (max 50MB)';
    }
  };

  return (
    <div className={`${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {getTitle()}
        </label>
      )}
      
      <div
        className={`
          ${sizeClasses[size]}
          border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer
          ${dragOver 
            ? 'border-[#4FBA73] bg-[#4FBA73]/5' 
            : 'border-gray-300 hover:border-[#4FBA73] hover:bg-gray-50'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center h-full text-center">
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4FBA73] mb-3"></div>
              <p className="text-sm text-gray-600">Upload en cours...</p>
            </>
          ) : (
            <>
              <div className={`text-gray-400 mb-3 ${dragOver ? 'text-[#4FBA73]' : ''}`}>
                {getIcon()}
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                {dragOver ? 'Déposez votre fichier ici' : 'Cliquez pour sélectionner'}
              </p>
              <p className="text-xs text-gray-500">
                {getDescription()}
              </p>
              {uploadType === 'media' && (
                <div className="flex items-center space-x-4 mt-3 text-xs text-gray-400">
                  <div className="flex items-center">
                    <ImageIcon className="w-3 h-3 mr-1" />
                    JPG, PNG, WebP
                  </div>
                  <div className="flex items-center">
                    <Video className="w-3 h-3 mr-1" />
                    MP4, WebM, MOV
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptedTypes()}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}