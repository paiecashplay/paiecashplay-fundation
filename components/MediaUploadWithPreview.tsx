'use client';

import { useState } from 'react';
import { Upload, X, Eye, Trash2 } from 'lucide-react';
import { useToastContext } from '@/components/ToastProvider';
import FileUploadZone from './FileUploadZone';

interface MediaFile {
  file: File;
  preview: string;
  id: string;
}

interface MediaUploadWithPreviewProps {
  onUpload: (files: File[]) => Promise<void>;
  uploading?: boolean;
  uploadProgress?: number;
  maxFiles?: number;
  accept?: string;
  maxSize?: number;
}

export default function MediaUploadWithPreview({
  onUpload,
  uploading = false,
  uploadProgress = 0,
  maxFiles = 10,
  accept = "image/*,video/*",
  maxSize = 50
}: MediaUploadWithPreviewProps) {
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  const { toast } = useToastContext();

  const handleFileSelect = (files: File[]) => {
    const newFiles: MediaFile[] = [];
    
    files.forEach(file => {
      if (selectedFiles.length + newFiles.length >= maxFiles) {
        toast.error('Limite atteinte', `Maximum ${maxFiles} fichiers`);
        return;
      }

      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const preview = URL.createObjectURL(file);
      
      newFiles.push({ file, preview, id });
    });

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Aucun fichier', 'Sélectionnez au moins un fichier');
      return;
    }

    try {
      const files = selectedFiles.map(sf => sf.file);
      await onUpload(files);
      
      // Nettoyer les previews
      selectedFiles.forEach(sf => URL.revokeObjectURL(sf.preview));
      setSelectedFiles([]);
      
      toast.success('Upload réussi', 'Tous les fichiers ont été uploadés');
    } catch (error) {
      toast.error('Erreur d\'upload', 'Une erreur est survenue');
    }
  };

  const clearAll = () => {
    selectedFiles.forEach(sf => URL.revokeObjectURL(sf.preview));
    setSelectedFiles([]);
  };

  return (
    <div className="space-y-6">
      {/* Zone d'upload */}
      <FileUploadZone
        onFileSelect={handleFileSelect}
        accept={accept}
        maxSize={maxSize}
        disabled={uploading || selectedFiles.length >= maxFiles}
      />

      {/* Prévisualisation des fichiers sélectionnés */}
      {selectedFiles.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">
              Fichiers sélectionnés ({selectedFiles.length}/{maxFiles})
            </h3>
            <button
              onClick={clearAll}
              disabled={uploading}
              className="text-red-600 hover:text-red-700 text-sm disabled:opacity-50"
            >
              Tout supprimer
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {selectedFiles.map((mediaFile) => (
              <div key={mediaFile.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  {mediaFile.file.type.startsWith('image/') ? (
                    <img
                      src={mediaFile.preview}
                      alt={mediaFile.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={mediaFile.preview}
                      className="w-full h-full object-cover"
                      muted
                    />
                  )}
                </div>
                
                {/* Overlay avec actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                  <button
                    onClick={() => window.open(mediaFile.preview, '_blank')}
                    className="bg-white/20 hover:bg-white/30 p-2 rounded-lg"
                  >
                    <Eye className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => removeFile(mediaFile.id)}
                    disabled={uploading}
                    className="bg-red-500/80 hover:bg-red-500 p-2 rounded-lg disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Nom du fichier */}
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {mediaFile.file.name}
                </p>
                <p className="text-xs text-gray-400">
                  {(mediaFile.file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            ))}
          </div>

          {/* Bouton d'upload */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {selectedFiles.reduce((acc, sf) => acc + sf.file.size, 0) / 1024 / 1024 < 1 
                ? `${(selectedFiles.reduce((acc, sf) => acc + sf.file.size, 0) / 1024).toFixed(0)} KB`
                : `${(selectedFiles.reduce((acc, sf) => acc + sf.file.size, 0) / 1024 / 1024).toFixed(1)} MB`
              } au total
            </div>
            
            <button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              className="bg-[#4FBA73] hover:bg-[#3da562] text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Upload en cours... {uploadProgress}%</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Uploader {selectedFiles.length} fichier{selectedFiles.length > 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          </div>

          {/* Barre de progression */}
          {uploading && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#4FBA73] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}