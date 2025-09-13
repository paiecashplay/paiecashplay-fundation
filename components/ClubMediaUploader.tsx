'use client';

import { useState } from 'react';
import { Image as ImageIcon, Video, Trash2, Eye, Building } from 'lucide-react';
import { useToastContext } from '@/components/ToastProvider';
import MediaUploadWithPreview from './MediaUploadWithPreview';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  description?: string;
  createdAt: string;
}

interface ClubMediaUploaderProps {
  media: MediaItem[];
  onMediaUpdate: () => void;
  canEdit?: boolean;
}

export default function ClubMediaUploader({ media, onMediaUpdate, canEdit = false }: ClubMediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToastContext();

  const handleUpload = async (files: File[]) => {
    if (!canEdit) return;
    
    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulation de progression
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 15, 90));
      }, 300);

      // Upload chaque fichier
      for (const file of files) {
        const type = file.type.startsWith('image/') ? 'image' : 'video';
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        formData.append('title', file.name);

        const response = await fetch('/api/club/media', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erreur d\'upload');
        }
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      onMediaUpdate();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      throw new Error(message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteMedia = async (mediaId: string) => {
    if (!canEdit) return;
    
    try {
      const response = await fetch(`/api/club/media?mediaId=${mediaId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Supprimé', 'Le média a été supprimé');
        onMediaUpdate();
      } else {
        toast.error('Erreur', 'Impossible de supprimer le média');
      }
    } catch (error) {
      toast.error('Erreur', 'Une erreur est survenue');
    }
  };

  const images = media.filter(m => m.type === 'image');
  const videos = media.filter(m => m.type === 'video');

  return (
    <div className="space-y-8">
      {/* Zone d'upload */}
      {canEdit && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2 text-[#4FBA73]" />
            Ajouter des médias du club
          </h3>
          
          <MediaUploadWithPreview
            onUpload={handleUpload}
            uploading={uploading}
            uploadProgress={uploadProgress}
            maxFiles={20}
            accept="image/*,video/*"
            maxSize={50}
          />
        </div>
      )}

      {/* Galerie Photos */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-[#4FBA73]" />
            Photos du club ({images.length})
          </h3>
        </div>
        
        {images.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune photo du club</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((item) => (
              <div key={item.id} className="relative group">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                  <button className="bg-white/20 hover:bg-white/30 p-2 rounded-lg">
                    <Eye className="w-4 h-4 text-white" />
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => deleteMedia(item.id)}
                      className="bg-red-500/80 hover:bg-red-500 p-2 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1 truncate">{item.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Galerie Vidéos */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold flex items-center">
            <Video className="w-5 h-5 mr-2 text-[#4FBA73]" />
            Vidéos du club ({videos.length})
          </h3>
        </div>
        
        {videos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Video className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune vidéo du club</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {videos.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="relative">
                  <video
                    src={item.url}
                    className="w-full h-48 object-cover rounded-lg"
                    controls
                  />
                  {canEdit && (
                    <button
                      onClick={() => deleteMedia(item.id)}
                      className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 p-2 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
                <h4 className="font-medium">{item.title}</h4>
                {item.description && (
                  <p className="text-sm text-gray-600">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}