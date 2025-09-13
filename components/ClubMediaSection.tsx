'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon, Video, Camera, Upload, Eye, Trash2 } from 'lucide-react';
import { useToastContext } from '@/components/ToastProvider';
import QuickUploadZone from './QuickUploadZone';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  description?: string;
  createdAt: string;
}

interface ClubMediaSectionProps {
  canEdit?: boolean;
}

export default function ClubMediaSection({ canEdit = true }: ClubMediaSectionProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToastContext();

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/club/media');
      
      if (response.ok) {
        const mediaData = await response.json();
        setMedia(mediaData);
      }
    } catch (error) {
      toast.error('Erreur', 'Impossible de charger les médias');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    loadMedia();
  };

  const deleteMedia = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/club/media?mediaId=${mediaId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Supprimé', 'Le média a été supprimé');
        loadMedia();
      } else {
        toast.error('Erreur', 'Impossible de supprimer le média');
      }
    } catch (error) {
      toast.error('Erreur', 'Une erreur est survenue');
    }
  };

  const images = media.filter(m => m.type === 'image');
  const videos = media.filter(m => m.type === 'video');

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Zone d'upload rapide */}
      {canEdit && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Camera className="w-6 h-6 mr-3 text-[#4FBA73]" />
            Ajouter des médias
          </h3>
          
          <QuickUploadZone
            entityType="club"
            uploadType="media"
            onUploadSuccess={handleUploadSuccess}
            size="md"
            showLabel={false}
          />
        </div>
      )}

      {/* Galerie Photos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <ImageIcon className="w-6 h-6 mr-3 text-[#4FBA73]" />
            Photos du club ({images.length})
          </h3>
        </div>
        
        {images.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Aucune photo</p>
            {canEdit && (
              <p className="text-sm">Utilisez la zone d'upload ci-dessus pour ajouter des photos</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((item) => (
              <div key={item.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                  <button 
                    onClick={() => window.open(item.url, '_blank')}
                    className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4 text-white" />
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => deleteMedia(item.id)}
                      className="bg-red-500/80 hover:bg-red-500 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
                
                <p className="text-xs text-gray-600 mt-2 truncate font-medium">{item.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Galerie Vidéos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Video className="w-6 h-6 mr-3 text-[#4FBA73]" />
            Vidéos du club ({videos.length})
          </h3>
        </div>
        
        {videos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Video className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Aucune vidéo</p>
            {canEdit && (
              <p className="text-sm">Utilisez la zone d'upload ci-dessus pour ajouter des vidéos</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {videos.map((item) => (
              <div key={item.id} className="space-y-3">
                <div className="relative rounded-lg overflow-hidden bg-gray-100">
                  <video
                    src={item.url}
                    className="w-full h-48 object-cover"
                    controls
                    preload="metadata"
                  />
                  {canEdit && (
                    <button
                      onClick={() => deleteMedia(item.id)}
                      className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}