import React, { createContext, useContext, useState, useEffect } from 'react';

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
  updateSiteInfo: (updates: Partial<SiteInfo>) => void;
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

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteInfo, setSiteInfo] = useState<SiteInfo>(DEFAULT_SITE_INFO);
  
  useEffect(() => {
    // Load site info from localStorage or use defaults
    const storedSiteInfo = localStorage.getItem('siteInfo');
    if (storedSiteInfo) {
      setSiteInfo(JSON.parse(storedSiteInfo));
    } else {
      localStorage.setItem('siteInfo', JSON.stringify(DEFAULT_SITE_INFO));
    }
  }, []);

  const updateSiteInfo = (updates: Partial<SiteInfo>) => {
    const updatedInfo = { ...siteInfo, ...updates };
    setSiteInfo(updatedInfo);
    localStorage.setItem('siteInfo', JSON.stringify(updatedInfo));
  };

  return (
    <SiteContext.Provider value={{ siteInfo, updateSiteInfo }}>
      {children}
    </SiteContext.Provider>
  );
};
