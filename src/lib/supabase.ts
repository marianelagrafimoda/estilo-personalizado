
import { supabase } from '../integrations/supabase/client';

// Helper function to check if Supabase connection is alive
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('site_info').select('*').limit(1);
    return !error;
  } catch (error) {
    console.error('Error checking Supabase connection:', error);
    return false;
  }
};

// Função para salvar imagens no bucket de storage
export const uploadImage = async (file: File, bucket: string = 'images', path: string = 'products/') => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Retorna a URL pública da imagem
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Função para buscar todas as imagens do carrossel
export const getCarouselImages = async () => {
  try {
    const { data, error } = await supabase
      .storage
      .from('site_images')
      .list('site/', {
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (error) throw error;
    
    // Converter os nomes de arquivos em URLs públicas
    return data.map(file => {
      const { data } = supabase
        .storage
        .from('site_images')
        .getPublicUrl(`site/${file.name}`);
      
      return data.publicUrl;
    });
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    return [];
  }
};

// Função para guardar informações do site
export const saveSiteInfo = async (siteInfo: any) => {
  try {
    const { data, error } = await supabase
      .from('site_info')
      .upsert([siteInfo], { onConflict: 'id' });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving site info:', error);
    throw error;
  }
};

// Criar os buckets de storage caso não existam
export const setupDatabase = async () => {
  try {
    // Verificar e criar storage buckets
    const { error: siteImagesError } = await supabase.storage.createBucket('site_images', {
      public: true,
      fileSizeLimit: 10485760 // 10MB
    });
    
    if (siteImagesError && !siteImagesError.message.includes('already exists')) {
      console.error('Error creating site_images bucket:', siteImagesError);
    }
    
    const { error: productImagesError } = await supabase.storage.createBucket('product_images', {
      public: true,
      fileSizeLimit: 10485760 // 10MB
    });
    
    if (productImagesError && !productImagesError.message.includes('already exists')) {
      console.error('Error creating product_images bucket:', productImagesError);
    }
    
    console.log('Database setup completed');
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
  }
};

// Inicializar banco de dados ao importar este módulo
setupDatabase().catch(console.error);
