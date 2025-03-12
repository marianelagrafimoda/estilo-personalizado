
import React, { createContext, useContext, useState, useEffect } from 'react';

interface SiteInfo {
  slogan: string;
  whatsappNumber: string;
  carouselImages: string[];
}

interface SiteContextType {
  siteInfo: SiteInfo;
  updateSiteInfo: (updates: Partial<SiteInfo>) => void;
}

const DEFAULT_SITE_INFO: SiteInfo = {
  slogan: "Estilo único, personalizado para ti",
  whatsappNumber: "+593990893095",
  carouselImages: ['/carousel1.jpg', '/carousel2.jpg', '/carousel3.jpg']
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
