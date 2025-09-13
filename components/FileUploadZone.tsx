'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileImage, FileVideo, File } from 'lucide-react';
import { useToastContext } from '@/components/ToastProvider';

interface FileUploadZoneProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // en MB
  disabled?: boolean;
  className?: string;
}

export default function FileUploadZone({
  onFileSelect,
  accept = "image/*,video/*",
  multiple = true,
  maxSize = 50,
  disabled = false,
  className = ""
}: FileUploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToastContext();

  const validateFiles = (files: FileList): File[] => {
    const validFiles: File[] = [];
    const maxSizeBytes = maxSize * 1024 * 1024;

    Array.from(files).forEach(file => {
      if (file.size > maxSizeBytes) {
        toast.error('Fichier trop volumineux', `${file.name} dépasse ${maxSize}MB`);
        return;
      }
      validFiles.push(file);
    });

    return validFiles;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || disabled) return;
    
    const validFiles = validateFiles(files);
    if (validFiles.length > 0) {
      onFileSelect(validFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const getFileIcon = (accept: string) => {
    if (accept.includes('image')) return <FileImage className="w-8 h-8 text-gray-400" />;
    if (accept.includes('video')) return <FileVideo className="w-8 h-8 text-gray-400" />;
    return <File className="w-8 h-8 text-gray-400" />;
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          dragOver 
            ? 'border-[#4FBA73] bg-[#4FBA73]/5' 
            : disabled
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 hover:border-[#4FBA73] hover:bg-gray-50'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); !disabled && setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            {getFileIcon(accept)}
          </div>
          <div>
            <p className={`text-lg font-medium ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
              {disabled ? 'Upload désactivé' : (
                <>
                  Glissez vos fichiers ici ou{' '}
                  <span className="text-[#4FBA73] hover:underline">parcourez</span>
                </>
              )}
            </p>
            {!disabled && (
              <p className="text-sm text-gray-500 mt-2">
                {accept.includes('image') && accept.includes('video') 
                  ? `Images et vidéos (max ${maxSize}MB)`
                  : accept.includes('image')
                  ? `Images uniquement (max ${maxSize}MB)`
                  : accept.includes('video')
                  ? `Vidéos uniquement (max ${maxSize}MB)`
                  : `Fichiers (max ${maxSize}MB)`
                }
              </p>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}