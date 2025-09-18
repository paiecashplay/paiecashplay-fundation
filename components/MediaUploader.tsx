'use client';

import { useState } from 'react';
import { Image as ImageIcon, Video, Trash2, Eye, X } from 'lucide-react';
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

interface MediaUploaderProps {
  playerId: string;
  media: MediaItem[];
  onMediaUpdate: () => void;
  canEdit?: boolean;
}

export default function MediaUploader({ playerId, media, onMediaUpdate, canEdit = false }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<MediaItem | null>(null);
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

        const response = await fetch(`/api/players/${playerId}/media`, {
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
    
    setDeleting(mediaId);
    try {
      const response = await fetch(`/api/players/${playerId}/media?mediaId=${mediaId}`, {
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
    } finally {
      setDeleting(null);
      setShowDeleteModal(null);
    }
  };



  const images = media.filter(m => m.type === 'image');
  const videos = media.filter(m => m.type === 'video');

  return (
    <div className="space-y-8">
      {/* Zone d'upload */}
      {canEdit && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Ajouter des médias</h3>
          
          <MediaUploadWithPreview
            onUpload={handleUpload}
            uploading={uploading}
            uploadProgress={uploadProgress}
            maxFiles={10}
            accept="image/*,video/*"
            maxSize={10}
          />
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
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((item) => (
              <div key={item.id} className="relative group">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-48 object-contain bg-gray-100 rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                  <button 
                    onClick={() => setViewingImage(item)}
                    className="bg-white/20 hover:bg-white/30 p-2 rounded-lg"
                  >
                    <Eye className="w-4 h-4 text-white" />
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => setShowDeleteModal(item.id)}
                      disabled={deleting === item.id}
                      className="bg-red-500/80 hover:bg-red-500 p-2 rounded-lg disabled:opacity-50"
                    >
                      {deleting === item.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="w-4 h-4 text-white" />
                      )}
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
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {videos.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="relative">
                  <video
                    src={item.url}
                    className="w-full h-64 object-contain bg-gray-100 rounded-lg"
                    controls
                  />
                  {canEdit && (
                    <button
                      onClick={() => setShowDeleteModal(item.id)}
                      disabled={deleting === item.id}
                      className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 p-2 rounded-lg disabled:opacity-50"
                    >
                      {deleting === item.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="w-4 h-4 text-white" />
                      )}
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

      {/* Modal de confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce média ? Cette action est irréversible.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(null)}
                disabled={deleting === showDeleteModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={() => deleteMedia(showDeleteModal)}
                disabled={deleting === showDeleteModal}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center space-x-2"
              >
                {deleting === showDeleteModal ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Suppression...</span>
                  </>
                ) : (
                  <span>Supprimer</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Viewer d'image */}
      {viewingImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={() => setViewingImage(null)}>
          <div className="relative max-w-screen-lg max-h-screen-lg p-4">
            <button
              onClick={() => setViewingImage(null)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-lg z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <img
              src={viewingImage.url}
              alt={viewingImage.title}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-4 bg-black/50 text-white p-3 rounded-lg">
              <h3 className="font-medium">{viewingImage.title}</h3>
              {viewingImage.description && (
                <p className="text-sm text-gray-300 mt-1">{viewingImage.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}