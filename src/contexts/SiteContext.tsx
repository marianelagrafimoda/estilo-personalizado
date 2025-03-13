
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

  // Carregar informações do site do Supabase
  useEffect(() => {
    const fetchSiteInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('site_info')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('Erro ao buscar informações do site:', error);
          setIsLoading(false);
          return;
        }

        if (data) {
          // Transformar o array de imagens de JSON para array se necessário
          const carousel_images = typeof data.carousel_images === 'string' 
            ? JSON.parse(data.carousel_images) 
            : data.carousel_images;

          setSiteInfo({
            slogan: data.slogan,
            whatsapp_number: data.whatsapp_number,
            carousel_images,
            unique_style_title: data.unique_style_title,
            materials_title: data.materials_title,
            materials_description: data.materials_description,
            design_title: data.design_title,
            design_description: data.design_description,
            service_title: data.service_title,
            service_description: data.service_description,
            faq_title: data.faq_title,
          });
        }
      } catch (error) {
        console.error('Erro ao processar dados do site:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiteInfo();
  }, []);

  const updateSiteInfo = async (updates: Partial<SiteInfo>) => {
    try {
      setIsLoading(true);
      
      // Buscar o ID do registro existente
      const { data: existingRecord, error: fetchError } = await supabase
        .from('site_info')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const updatedInfo = { ...siteInfo, ...updates };
      
      // Se encontramos um registro existente, atualizamos
      if (existingRecord) {
        const { error } = await supabase
          .from('site_info')
          .update(updatedInfo)
          .eq('id', existingRecord.id);
        
        if (error) throw error;
      } else {
        // Caso contrário, inserimos um novo registro
        const { error } = await supabase
          .from('site_info')
          .insert([updatedInfo]);
        
        if (error) throw error;
      }

      setSiteInfo(updatedInfo);
      toast({
        title: "Sucesso",
        description: "Informações do site atualizadas com sucesso",
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Erro ao atualizar informações do site:', error);
      toast({
        title: "Erro",
        description: `Falha ao atualizar: ${error.message || 'Erro desconhecido'}`,
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
