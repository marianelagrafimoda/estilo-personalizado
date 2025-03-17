
import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface ProductImagesUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onUploadImage: (file: File) => Promise<string>;
  maxImages?: number;
}

const ProductImagesUploader: React.FC<ProductImagesUploaderProps> = ({
  images = [],
  onImagesChange,
  onUploadImage,
  maxImages = 6 // Permite até 6 imagens (1 principal + 5 adicionais)
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const availableSlots = maxImages - images.length;
    if (availableSlots <= 0) {
      setUploadError(`Você já atingiu o limite máximo de ${maxImages} imagens.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, availableSlots);
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const uploadPromises = filesToUpload.map(file => onUploadImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      onImagesChange([...images, ...uploadedUrls]);
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadError('Erro ao fazer upload das imagens. Tente novamente.');
    } finally {
      setIsUploading(false);
      // Reset input value to allow uploading the same file again
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    onImagesChange(updatedImages);
  };

  const handleReorderImages = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {images.map((imageUrl, index) => (
          <div 
            key={index} 
            className="relative group aspect-square border rounded-md overflow-hidden bg-gray-100"
          >
            <img 
              src={imageUrl} 
              alt={`Product image ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button 
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="p-1 bg-red-500 text-white rounded-full"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {index === 0 && (
              <div className="absolute top-0 left-0 bg-lilac text-white text-xs px-2 py-1">
                Principal
              </div>
            )}
          </div>
        ))}
        
        {/* Upload button for adding more images */}
        {images.length < maxImages && (
          <label 
            className={cn(
              "cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-md p-4 transition-colors",
              "hover:border-lilac hover:bg-lilac/5",
              "aspect-square"
            )}
          >
            <ImageIcon className="h-6 w-6 mb-2 text-gray-400" />
            <span className="text-xs text-center text-gray-500">
              Adicionar imagem
            </span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload}
              disabled={isUploading} 
              multiple
            />
          </label>
        )}
      </div>
      
      {uploadError && (
        <p className="text-red-500 text-sm mt-2">{uploadError}</p>
      )}
      
      {isUploading && (
        <p className="text-sm text-gray-600">Enviando imagens...</p>
      )}
      
      <div className="text-xs text-gray-500">
        {images.length} de {maxImages} imagens. A primeira será a imagem principal.
      </div>
    </div>
  );
};

export default ProductImagesUploader;
