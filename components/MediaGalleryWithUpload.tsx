'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon, Video, Trash2, Eye, Plus } from 'lucide-react';
import { useToastContext } from '@/components/ToastProvider';
import UniversalUploadZone from './UniversalUploadZone';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  description?: string;
  createdAt: string;
}

interface MediaGalleryWithUploadProps {
  entityId: string;
  entityType: 'player' | 'club' | 'user';
  canEdit?: boolean;
  title?: string;
}

export default function MediaGalleryWithUpload({ 
  entityId, 
  entityType, 
  canEdit = false,
  title = "Galerie Média"
}: MediaGalleryWithUploadProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const { toast } = useToastContext();

  const fetchMedia = async () => {
    try {
      const response = await fetch(`/api/${entityType === 'user' ? 'users' : entityType}/${entityId}/media`);
      if (response.ok) {
        const data = await response.json();
        setMedia(data);
      }
    } catch (error) {
      console.error('Erreur chargement médias:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [entityId, entityType]);

  const handleUploadSuccess = (url: string) => {
    fetchMedia();
    setShowUpload(false);
    toast.success('Média ajouté', 'Le fichier a été ajouté à la galerie');
  };

  const deleteMedia = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/${entityType === 'user' ? 'users' : entityType}/${entityId}/media?mediaId=${mediaId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Supprimé', 'Le média a été supprimé');
        fetchMedia();
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
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Zone d'upload */}
      {canEdit && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Ajouter des médias</h3>
            {!showUpload && (
              <button
                onClick={() => setShowUpload(true)}
                className="bg-[#4FBA73] hover:bg-[#3da562] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter</span>
              </button>
            )}
          </div>
          
          {showUpload && (
            <div className="space-y-4">
              <UniversalUploadZone
                entityId={entityId}
                entityType={entityType}
                uploadType="media"
                onUploadSuccess={handleUploadSuccess}
                accept="image/*,video/*"
                maxSize={50}
                showPreview={false}
              />
              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      )}

      {/* Galerie Photos */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-[#4FBA73]" />
            Photos ({images.length})
          </h3>
        </div>
        
        {images.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune photo</p>
            {canEdit && (
              <button
                onClick={() => setShowUpload(true)}
                className="mt-4 text-[#4FBA73] hover:underline"
              >
                Ajouter la première photo
              </button>
            )}
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
            Vidéos ({videos.length})
          </h3>
        </div>
        
        {videos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Video className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune vidéo</p>
            {canEdit && (
              <button
                onClick={() => setShowUpload(true)}
                className="mt-4 text-[#4FBA73] hover:underline"
              >
                Ajouter la première vidéo
              </button>
            )}
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