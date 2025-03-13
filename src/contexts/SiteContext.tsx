import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';

interface SiteInfo {
  slogan: string;
  whatsapp_number: string;
  carousel_images: string[];
  unique_style_title: string;
  materials_title: string;
  materials_description: string;
  design_title: string;
  design_description: string;
  service_title: string;
  service_description: string;
  faq_title: string;
}

interface SiteContextType {
  siteInfo: SiteInfo;
  updateSiteInfo: (updates: Partial<SiteInfo>) => Promise<void>;
  isLoading: boolean;
}

const DEFAULT_SITE_INFO: SiteInfo = {
  slogan: "Estilo único, personalizado para ti",
  whatsapp_number: "+593990893095",
  carousel_images: ['/carousel1.jpg', '/carousel2.jpg', '/carousel3.jpg'],
  unique_style_title: "¿Quieres un estilo realmente único?",
  materials_title: "Materiales Premium",
  materials_description: "Utilizamos solo los mejores materiales para asegurar la calidad y durabilidad de nuestros productos.",
  design_title: "Diseño Personalizado",
  design_description: "Creamos diseños únicos adaptados a tus preferencias y estilo personal.",
  service_title: "Atención Personalizada",
  service_description: "Te guiamos durante todo el proceso para asegurar que obtengas exactamente lo que deseas.",
  faq_title: "Todo lo que necesitas saber",
};

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const useSiteInfo = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSiteInfo debe ser usado dentro de un SiteProvider');
  }
  return context;
};

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteInfo, setSiteInfo] = useState<SiteInfo>(DEFAULT_SITE_INFO);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch site info from Supabase
  useEffect(() => {
    const fetchSiteInfo = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching site info...');
        
        const { data, error } = await supabase
          .from('site_info')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          // If no records found, we'll create a default one
          if (error.code === 'PGRST116') {
            console.log('No site info found, creating default...');
            await createDefaultSiteInfo();
            return;
          }
          
          console.error('Error fetching site info:', error);
          toast({
            title: "Error",
            description: `Error al cargar información del sitio: ${error.message}`,
            variant: "destructive",
            duration: 5000,
          });
          return;
        }

        console.log('Site info from Supabase:', data);
        
        if (data) {
          // Parse carousel_images based on its type
          let parsedCarouselImages: string[] = [];
          
          if (data.carousel_images) {
            // If it's a string, try to parse it as JSON
            if (typeof data.carousel_images === 'string') {
              try {
                const parsed = JSON.parse(data.carousel_images);
                // Ensure the parsed result is an array and all elements are strings
                if (Array.isArray(parsed)) {
                  parsedCarouselImages = parsed.map(String);
                } else {
                  parsedCarouselImages = [String(parsed)];
                }
              } catch (e) {
                console.error('Error parsing carousel_images string:', e);
                parsedCarouselImages = [data.carousel_images]; // Use as single item array if parsing fails
              }
            } 
            // If it's already an array, ensure all elements are strings
            else if (Array.isArray(data.carousel_images)) {
              parsedCarouselImages = data.carousel_images.map(String);
            } 
            // Otherwise, use default
            else {
              console.warn('carousel_images is not in expected format:', data.carousel_images);
              parsedCarouselImages = DEFAULT_SITE_INFO.carousel_images;
            }
          } else {
            parsedCarouselImages = DEFAULT_SITE_INFO.carousel_images;
          }

          setSiteInfo({
            slogan: data.slogan || DEFAULT_SITE_INFO.slogan,
            whatsapp_number: data.whatsapp_number || DEFAULT_SITE_INFO.whatsapp_number,
            carousel_images: parsedCarouselImages,
            unique_style_title: data.unique_style_title || DEFAULT_SITE_INFO.unique_style_title,
            materials_title: data.materials_title || DEFAULT_SITE_INFO.materials_title,
            materials_description: data.materials_description || DEFAULT_SITE_INFO.materials_description,
            design_title: data.design_title || DEFAULT_SITE_INFO.design_title,
            design_description: data.design_description || DEFAULT_SITE_INFO.design_description,
            service_title: data.service_title || DEFAULT_SITE_INFO.service_title,
            service_description: data.service_description || DEFAULT_SITE_INFO.service_description,
            faq_title: data.faq_title || DEFAULT_SITE_INFO.faq_title,
          });
          
          console.log('Site info loaded successfully');
        }
      } catch (error: any) {
        console.error('Error processing site info:', error);
        toast({
          title: "Error",
          description: `Error inesperado: ${error.message || 'Error desconocido'}`,
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiteInfo();
  }, [toast]);

  // Create default site info if none exists
  const createDefaultSiteInfo = async () => {
    try {
      console.log('Creating default site info...');
      
      // Convert carousel_images to a JSON compatible format
      const carouselImagesArray = DEFAULT_SITE_INFO.carousel_images;
      
      // Prepare default site info for database
      const dbSiteInfo = {
        ...DEFAULT_SITE_INFO,
        carousel_images: carouselImagesArray
      };
      
      const { error } = await supabase
        .from('site_info')
        .insert([dbSiteInfo]);
      
      if (error) {
        console.error('Error creating default site info:', error);
        throw error;
      }
      
      setSiteInfo(DEFAULT_SITE_INFO);
      console.log('Default site info created successfully');
    } catch (error: any) {
      console.error('Error creating default site info:', error);
      toast({
        title: "Error",
        description: `Error al crear información por defecto: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSiteInfo = async (updates: Partial<SiteInfo>) => {
    try {
      setIsLoading(true);
      console.log('Updating site info:', updates);
      
      // Prepare updates for database
      const dbUpdates = {
        ...updates,
        // Ensure carousel_images is sent correctly if it's being updated
        ...(updates.carousel_images ? { carousel_images: updates.carousel_images } : {})
      };
      
      console.log('Prepared updates for database:', dbUpdates);
      
      // Fetch the ID of the existing record
      const { data: existingRecord, error: fetchError } = await supabase
        .from('site_info')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing site info:', fetchError);
        throw fetchError;
      }

      const updatedInfo = { ...siteInfo, ...updates };
      
      // If we found an existing record, update it
      if (existingRecord) {
        const { error } = await supabase
          .from('site_info')
          .update(dbUpdates)
          .eq('id', existingRecord.id);
        
        if (error) {
          console.error('Error updating site info:', error);
          throw error;
        }
      } else {
        // Otherwise, insert a new record with all required fields
        const fullDbSiteInfo = {
          ...siteInfo,
          ...dbUpdates
        };
        
        const { error } = await supabase
          .from('site_info')
          .insert([fullDbSiteInfo]);
        
        if (error) {
          console.error('Error inserting site info:', error);
          throw error;
        }
      }

      setSiteInfo(updatedInfo);
      
      toast({
        title: "Éxito",
        description: "Información del sitio actualizada con éxito",
        duration: 3000,
      });
      
      console.log('Site info updated successfully');
    } catch (error: any) {
      console.error('Error updating site info:', error);
      toast({
        title: "Error",
        description: `Error al actualizar: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SiteContext.Provider value={{ siteInfo, updateSiteInfo, isLoading }}>
      {children}
    </SiteContext.Provider>
  );
};
