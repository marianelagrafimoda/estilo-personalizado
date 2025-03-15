
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

// Función para subir imágenes al bucket de storage
export const uploadImage = async (file: File, bucket: string = 'images', path: string = 'products/') => {
  try {
    // Verificar si el bucket existe
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucket);
    
    if (!bucketExists) {
      console.error(`Bucket ${bucket} does not exist`);
      throw new Error(`Error: El bucket ${bucket} no existe`);
    }
    
    // Generar nombre de archivo único usando timestamp + random string
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 10);
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}${timestamp}-${randomString}.${fileExt}`;
    
    console.log(`Uploading ${fileName} to ${bucket}`);
    
    // Subir el archivo
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true // Permitir sobreescribir archivos
      });
    
    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
    
    console.log('Upload successful:', data);
    
    // Retorna la URL pública de la imagen
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    console.log('Public URL:', urlData.publicUrl);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error en uploadImage:', error);
    throw error;
  }
};

// Función para buscar todas las imágenes del carrusel
export const getCarouselImages = async () => {
  try {
    // Verificar si el bucket existe
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'site_images');
    
    if (!bucketExists) {
      console.warn('Bucket site_images does not exist yet');
      return [];
    }
    
    const { data, error } = await supabase
      .storage
      .from('site_images')
      .list('site/', {
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (error) {
      console.error('Error fetching carousel images:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Convertir los nombres de archivos en URLs públicas
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

// Función para guardar información del sitio
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

// Verificar y crear buckets de storage si no existen
export const setupDatabase = async () => {
  try {
    // Verificar si los buckets existen
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking storage buckets:', bucketsError);
      return false;
    }
    
    const existingBuckets = new Set(buckets?.map(b => b.name));
    
    // Crear site_images bucket si no existe
    if (!existingBuckets.has('site_images')) {
      console.log('Creating site_images bucket...');
      const { error: siteImagesError } = await supabase.storage.createBucket('site_images', {
        public: true,
        fileSizeLimit: 4194304 // 4MB
      });
      
      if (siteImagesError && !siteImagesError.message.includes('already exists')) {
        console.error('Error creating site_images bucket:', siteImagesError);
      }
    }
    
    // Crear product_images bucket si no existe
    if (!existingBuckets.has('product_images')) {
      console.log('Creating product_images bucket...');
      const { error: productImagesError } = await supabase.storage.createBucket('product_images', {
        public: true,
        fileSizeLimit: 4194304 // 4MB
      });
      
      if (productImagesError && !productImagesError.message.includes('already exists')) {
        console.error('Error creating product_images bucket:', productImagesError);
      }
    }
    
    console.log('Database setup completed');
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
  }
};

// Inicializar banco de datos al importar este módulo
setupDatabase().catch(console.error);
