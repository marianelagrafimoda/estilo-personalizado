
import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import { setupDatabase } from '../lib/supabase';

interface ImageUploaderProps {
  onImageUpload: (file: File) => Promise<string>;
  label?: string;
  accept?: string;
  maxSize?: number; // en MB
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUpload,
  label = "Subir imagen",
  accept = "image/*",
  maxSize = 4
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Intentar configurar la base de datos al cargar el componente
  React.useEffect(() => {
    setupDatabase().catch(error => {
      console.error("Error setting up database from ImageUploader:", error);
    });
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validar tamaño del archivo (en bytes)
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast({
        title: "Archivo demasiado grande",
        description: `El tamaño máximo permitido es ${maxSize}MB.`,
        variant: "destructive"
      });
      return;
    }
    
    // Crear una URL temporal para pre-visualización
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    try {
      setIsUploading(true);
      
      // Intentar configurar la base de datos antes de cargar la imagen
      await setupDatabase();
      
      // Llamar a la función para hacer upload de la imagen
      const imageUrl = await onImageUpload(file);
      
      // Limpiar el input de archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast({
        title: "Imagen subida con éxito",
        description: "La imagen se ha subido correctamente."
      });
      
      return imageUrl;
    } catch (error) {
      console.error("Error al subir imagen:", error);
      
      // Mensaje más específico dependiendo del tipo de error
      let errorMessage = "Ocurrió un error desconocido";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Mensaje específico para el error de bucket no existe
        if (errorMessage.includes("bucket") && errorMessage.includes("no existe")) {
          errorMessage = "Error de almacenamiento: No se pudo acceder al bucket de imágenes. Por favor, contacte al administrador del sistema.";
        }
      }
      
      toast({
        title: "Error al subir imagen",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsUploading(false);
      // Liberar la URL temporal
      URL.revokeObjectURL(previewUrl);
      setPreview(null);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const cancelPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept={accept}
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {!preview ? (
        <Button
          type="button"
          onClick={triggerFileSelect}
          disabled={isUploading}
          variant="outline"
          className="w-full h-32 flex flex-col items-center justify-center border-dashed border-2 border-lilac/50 bg-transparent hover:bg-lilac/5"
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 mb-2 text-lilac animate-spin" />
          ) : (
            <Upload className="h-6 w-6 mb-2 text-lilac" />
          )}
          <span className="text-sm text-center">
            {isUploading ? "Subiendo..." : label}
            <br />
            <span className="text-xs text-gray-500">
              Tamaño máximo: {maxSize}MB
            </span>
          </span>
        </Button>
      ) : (
        <div className="relative border rounded-md overflow-hidden">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-32 object-cover"
          />
          <button
            onClick={cancelPreview}
            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </button>
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              Subiendo...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
