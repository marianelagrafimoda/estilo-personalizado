
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://rdpbuaxwyoyvxmdlpayj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcGJ1YXh3eW95dnhtZGxwYXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MzU1MzksImV4cCI6MjA1NzQxMTUzOX0.PnFISwrPPGbv3-HGJklgPQMqOytcOoN14nuShGOKFas';

export const supabase = createClient(supabaseUrl, supabaseKey);

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

// Criar a tabela de usuários_carts caso não exista
export const setupDatabase = async () => {
  try {
    // Verificar e criar tabela user_carts
    const { error: cartError } = await supabase.rpc('create_user_carts_if_not_exists');
    if (cartError) console.error('Error creating user_carts table:', cartError);
    
    // Verificar e criar storage buckets
    const { error: bucketError } = await supabase.storage.createBucket('site_images', {
      public: true,
      fileSizeLimit: 10485760 // 10MB
    });
    
    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('Error creating site_images bucket:', bucketError);
    }
    
    const { error: productBucketError } = await supabase.storage.createBucket('product_images', {
      public: true,
      fileSizeLimit: 10485760 // 10MB
    });
    
    if (productBucketError && !productBucketError.message.includes('already exists')) {
      console.error('Error creating product_images bucket:', productBucketError);
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
