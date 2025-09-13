'use client';

import { useState, useRef } from 'react';
import { Upload, Camera, Image, Video, X } from 'lucide-react';
import { useToastContext } from '@/components/ToastProvider';

interface UniversalUploadZoneProps {
  entityId: string;
  entityType: 'player' | 'club' | 'user';
  uploadType: 'profile' | 'media';
  onUploadSuccess: (url: string) => void;
  currentImage?: string;
  accept?: string;
  maxSize?: number;
  className?: string;
  showPreview?: boolean;
}

export default function UniversalUploadZone({
  entityId,
  entityType,
  uploadType,
  onUploadSuccess,
  currentImage,
  accept = "image/*",
  maxSize = 5,
  className = "",
  showPreview = true
}: UniversalUploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToastContext();

  const getApiEndpoint = () => {
    if (uploadType === 'profile') {
      return `/api/${entityType === 'user' ? 'users' : entityType}/${entityId}/profile-picture`;
    }
    return `/api/${entityType === 'user' ? 'users' : entityType}/${entityId}/media`;
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error('Fichier trop volumineux', `Maximum ${maxSize}MB`);
      return;
    }

    if (accept.includes('image') && !file.type.startsWith('image/')) {
      toast.error('Type invalide', 'Seules les images sont autorisées');
      return;
    }

    if (accept.includes('video') && !file.type.startsWith('video/')) {
      toast.error('Type invalide', 'Seules les vidéos sont autorisées');
      return;
    }

    try {
      setUploading(true);
      
      if (showPreview && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      }

      const formData = new FormData();
      formData.append('file', file);
      if (uploadType === 'media') {
        formData.append('type', file.type.startsWith('image/') ? 'image' : 'video');
        formData.append('title', file.name);
      }

      const response = await fetch(getApiEndpoint(), {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        onUploadSuccess(result.url);
        toast.success('Upload réussi', 'Fichier uploadé avec succès');
      } else {
        const error = await response.json();
        toast.error('Erreur d\'upload', error.error || 'Erreur inconnue');
        setPreview(currentImage || null);
      }
    } catch (error) {
      toast.error('Erreur d\'upload', 'Une erreur est survenue');
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  if (uploadType === 'profile') {
    return (
      <div className={`relative group ${className}`}>
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-[#4FBA73] to-[#3da562] flex items-center justify-center relative">
          {preview ? (
            <img src={preview} alt="Photo de profil" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-4xl font-bold">
              {entityId.charAt(0).toUpperCase()}
            </span>
          )}

          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {uploading ? (
              <Upload className="w-6 h-6 text-white animate-bounce" />
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
          accept={accept}
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
          disabled={uploading}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          dragOver 
            ? 'border-[#4FBA73] bg-[#4FBA73]/5' 
            : uploading
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 hover:border-[#4FBA73] hover:bg-gray-50'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); !uploading && setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            {uploading ? (
              <Upload className="w-8 h-8 text-[#4FBA73] animate-bounce" />
            ) : accept.includes('image') && accept.includes('video') ? (
              <Video className="w-8 h-8 text-gray-400" />
            ) : accept.includes('image') ? (
              <Image className="w-8 h-8 text-gray-400" />
            ) : (
              <Video className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div>
            <p className={`text-lg font-medium ${uploading ? 'text-gray-400' : 'text-gray-900'}`}>
              {uploading ? 'Upload en cours...' : (
                <>
                  Glissez vos fichiers ici ou{' '}
                  <span className="text-[#4FBA73] hover:underline">parcourez</span>
                </>
              )}
            </p>
            {!uploading && (
              <p className="text-sm text-gray-500 mt-2">
                {accept.includes('image') && accept.includes('video') 
                  ? `Images et vidéos (max ${maxSize}MB)`
                  : accept.includes('image')
                  ? `Images uniquement (max ${maxSize}MB)`
                  : `Vidéos uniquement (max ${maxSize}MB)`
                }
              </p>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}