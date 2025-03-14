
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, saveSiteInfo, uploadImage } from '../lib/supabase';
import { useToast } from '../hooks/use-toast';

interface SiteInfo {
  slogan: string;
  whatsappNumber: string;
  carouselImages: string[];
  uniqueStyleTitle: string;
  materialsTitle: string;
  materialsDescription: string;
  designTitle: string;
  designDescription: string;
  serviceTitle: string;
  serviceDescription: string;
  faqTitle: string;
}

interface SiteContextType {
  siteInfo: SiteInfo;
  updateSiteInfo: (updates: Partial<SiteInfo>) => Promise<void>;
  uploadSiteImage: (file: File) => Promise<string>;
}

const DEFAULT_SITE_INFO: SiteInfo = {
  slogan: "Estilo único, personalizado para ti",
  whatsappNumber: "+593990893095",
  carouselImages: ['/carousel1.jpg', '/carousel2.jpg', '/carousel3.jpg'],
  uniqueStyleTitle: "¿Quieres un estilo realmente único?",
  materialsTitle: "Materiales Premium",
  materialsDescription: "Utilizamos solo los mejores materiales para asegurar la calidad y durabilidad de nuestros productos.",
  designTitle: "Diseño Personalizado",
  designDescription: "Creamos diseños únicos adaptados a tus preferencias y estilo personal.",
  serviceTitle: "Atención Personalizada",
  serviceDescription: "Te guiamos durante todo el proceso para asegurar que obtengas exactamente lo que deseas.",
  faqTitle: "Todo lo que necesitas saber",
};

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const useSiteInfo = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSiteInfo debe ser usado dentro de un SiteProvider');
  }
  return context;
};

// Helper to convert camelCase to snake_case for Supabase
const camelToSnake = (str: string) => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

// Helper to convert snake_case to camelCase for our app
const snakeToCamel = (str: string) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

// Prepare data for Supabase (convert to snake_case)
const prepareForSupabase = (data: Partial<SiteInfo>) => {
  const result: Record<string, any> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    const snakeKey = camelToSnake(key);
    
    // Special handling for arrays (like carouselImages)
    if (Array.isArray(value)) {
      result[snakeKey] = value;
    } else {
      result[snakeKey] = value;
    }
  });
  
  return result;
};

// Prepare data from Supabase (convert to camelCase)
const prepareFromSupabase = (data: Record<string, any>): Partial<SiteInfo> => {
  const result: Partial<SiteInfo> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
      const camelKey = snakeToCamel(key) as keyof SiteInfo;
      
      // Special handling for carousel_images which could be string[] or string
      if (key === 'carousel_images') {
        if (typeof value === 'string') {
          try {
            // Try to parse if it's a JSON string
            const parsed = JSON.parse(value);
            result.carouselImages = Array.isArray(parsed) ? parsed.map(String) : [String(value)];
          } catch (e) {
            // If not valid JSON, treat as single string
            result.carouselImages = [String(value)];
          }
        } else if (Array.isArray(value)) {
          // If already an array, map elements to strings
          result.carouselImages = value.map(String);
        } else {
          // Fallback to default
          result.carouselImages = DEFAULT_SITE_INFO.carouselImages;
        }
      } else {
        // @ts-ignore - We know this is safe because we're filtering the keys
        result[camelKey] = value;
      }
    }
  });
  
  return result;
};

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteInfo, setSiteInfo] = useState<SiteInfo>(DEFAULT_SITE_INFO);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchSiteInfo = async () => {
      try {
        // Try to fetch from Supabase
        const { data, error } = await supabase
          .from('site_info')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (error) {
          console.error('Error fetching site info:', error);
          throw error;
        }
        
        if (data) {
          // Convert from snake_case to camelCase and handle special fields
          const formattedData = prepareFromSupabase(data);
          setSiteInfo(prev => ({ ...prev, ...formattedData }));
        }
      } catch (error) {
        console.error('Failed to fetch site info from Supabase:', error);
        
        // Fallback to localStorage
        const storedSiteInfo = localStorage.getItem('siteInfo');
        if (storedSiteInfo) {
          setSiteInfo(JSON.parse(storedSiteInfo));
        } else {
          // Use defaults and save to localStorage
          localStorage.setItem('siteInfo', JSON.stringify(DEFAULT_SITE_INFO));
        }
      }
    };
    
    fetchSiteInfo();
  }, []);

  const uploadSiteImage = async (file: File): Promise<string> => {
    try {
      const imageUrl = await uploadImage(file, 'site_images', 'site/');
      return imageUrl;
    } catch (error) {
      console.error('Error uploading site image:', error);
      toast({
        title: "Error al subir imagen",
        description: "No se pudo cargar la imagen. Inténtalo de nuevo.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateSiteInfo = async (updates: Partial<SiteInfo>) => {
    // Update local state immediately for UI responsiveness
    const updatedInfo = { ...siteInfo, ...updates };
    setSiteInfo(updatedInfo);
    
    try {
      // Prepare data for Supabase (convert camelCase to snake_case)
      const supabaseData = prepareForSupabase(updates);
      
      // Check if we already have data in Supabase
      const { data: existingData, error: fetchError } = await supabase
        .from('site_info')
        .select('id')
        .limit(1);
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existing site info:', fetchError);
        throw fetchError;
      }
      
      let result;
      if (existingData && existingData.length > 0) {
        // Update existing record
        result = await supabase
          .from('site_info')
          .update(supabaseData)
          .eq('id', existingData[0].id);
      } else {
        // Insert new record
        result = await supabase
          .from('site_info')
          .insert(supabaseData);
      }
      
      if (result.error) {
        console.error('Error updating site info in Supabase:', result.error);
        toast({
          title: "Error al guardar configuración",
          description: result.error.message,
          variant: "destructive",
        });
        throw result.error;
      }
      
      toast({
        title: "Configuración guardada",
        description: "La información del sitio ha sido actualizada correctamente.",
      });
    } catch (error) {
      console.error('Failed to save to Supabase, falling back to localStorage:', error);
      // Fallback to localStorage
      localStorage.setItem('siteInfo', JSON.stringify(updatedInfo));
    }
  };

  return (
    <SiteContext.Provider value={{ siteInfo, updateSiteInfo, uploadSiteImage }}>
      {children}
    </SiteContext.Provider>
  );
};
