
import { supabase } from '../integrations/supabase/client';

// Helper function to check if Supabase connection is alive
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('site_info').select('*').limit(1);
    if (error) {
      console.error('Error checking Supabase connection:', error);
      return false;
    }
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Error checking Supabase connection:', error);
    return false;
  }
};

// Ensure storage buckets exist
export const setupDatabase = async () => {
  try {
    console.log('Setting up database and checking storage buckets...');
    
    // Check if buckets exist
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking storage buckets:', bucketsError);
      return false;
    }
    
    const existingBuckets = new Set(buckets?.map(b => b.name) || []);
    console.log('Existing buckets:', existingBuckets);
    
    // Verificar a existência dos buckets e tentar criar se não existirem
    if (!existingBuckets.has('site_images')) {
      console.warn('site_images bucket não encontrado - tentando criar automaticamente');
      try {
        // Tentar criar o bucket via API (isso só funcionará se o usuário tiver permissões adequadas)
        const { data, error } = await supabase.storage.createBucket('site_images', {
          public: true
        });
        
        if (error) {
          console.error('Erro ao criar bucket site_images:', error);
          return false;
        }
        
        console.log('site_images bucket criado com sucesso');
      } catch (error) {
        console.error('Falha ao criar bucket site_images:', error);
      }
    } else {
      console.log('site_images bucket encontrado e pronto para uso');
    }
    
    if (!existingBuckets.has('product_images')) {
      console.warn('product_images bucket não encontrado - tentando criar automaticamente');
      try {
        // Tentar criar o bucket via API
        const { data, error } = await supabase.storage.createBucket('product_images', {
          public: true
        });
        
        if (error) {
          console.error('Erro ao criar bucket product_images:', error);
          return false;
        }
        
        console.log('product_images bucket criado com sucesso');
      } catch (error) {
        console.error('Falha ao criar bucket product_images:', error);
      }
    } else {
      console.log('product_images bucket encontrado e pronto para uso');
    }
    
    console.log('Database setup completed');
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
  }
};

// Function to upload images to storage bucket with retry mechanism
export const uploadImage = async (file: File, bucket: string = 'site_images', path: string = 'products/', maxRetries: number = 3) => {
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      // Check connection before attempting upload
      const connectionOk = await checkSupabaseConnection();
      if (!connectionOk) {
        console.error('Sem conexão com o Supabase. Verificando a conexão antes de tentar novamente...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
        retryCount++;
        continue;
      }
      
      // Check if the bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Erro ao verificar buckets:', bucketsError);
        throw new Error('Não foi possível acessar o armazenamento. Verifique sua conexão e permissões.');
      }
      
      const bucketExists = buckets?.some(b => b.name === bucket);
      
      if (!bucketExists) {
        console.error(`Bucket ${bucket} não existe`);
        // Tentar criar o bucket automaticamente
        try {
          const { error } = await supabase.storage.createBucket(bucket, {
            public: true
          });
          
          if (error) {
            throw new Error(`Não foi possível criar o bucket ${bucket}. Entre em contato com o administrador do sistema.`);
          }
          
          console.log(`Bucket ${bucket} criado com sucesso`);
        } catch (error) {
          console.error(`Erro ao criar bucket ${bucket}:`, error);
          throw new Error(`Para subir imagens, contacte com o administrador do sistema para criar o bucket ${bucket}.`);
        }
      }
      
      // Validate file size before uploading (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error(`Arquivo muito grande. O tamanho máximo permitido é 10MB.`);
      }
      
      // Generate unique filename using timestamp + random string
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(2, 10);
      const fileExt = file.name.split('.').pop();
      const fileName = `${path}${timestamp}-${randomString}.${fileExt}`;
      
      console.log(`Uploading ${fileName} to ${bucket}`);
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting files
        });
      
      if (error) {
        console.error('Erro ao subir imagem:', error);
        throw error;
      }
      
      console.log('Upload successful:', data);
      
      // Return the public URL of the image
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
      
      console.log('Public URL:', urlData.publicUrl);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error(`Tentativa ${retryCount + 1} falhou:`, error);
      
      if (retryCount < maxRetries - 1) {
        // Exponential backoff: wait longer between each retry
        const waitTime = Math.pow(2, retryCount) * 1000;
        console.log(`Tentando novamente em ${waitTime/1000} segundos...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        retryCount++;
      } else {
        console.error('Todas as tentativas falharam');
        throw error;
      }
    }
  }
  
  throw new Error('Falha ao enviar imagem após várias tentativas');
};

// Function to fetch all carousel images
export const getCarouselImages = async () => {
  try {
    // Check if the bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'site_images');
    
    if (!bucketExists) {
      console.warn('Bucket site_images não existe ainda');
      return [];
    }
    
    const { data, error } = await supabase
      .storage
      .from('site_images')
      .list('site/', {
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (error) {
      console.error('Erro ao buscar imagens do carrossel:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Convert filenames to public URLs
    return data.map(file => {
      const { data } = supabase
        .storage
        .from('site_images')
        .getPublicUrl(`site/${file.name}`);
      
      return data.publicUrl;
    });
  } catch (error) {
    console.error('Erro ao buscar imagens do carrossel:', error);
    return [];
  }
};

// Function to save site info
export const saveSiteInfo = async (siteInfo: any) => {
  try {
    const { data, error } = await supabase
      .from('site_info')
      .upsert([siteInfo], { onConflict: 'id' });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao salvar informações do site:', error);
    throw error;
  }
};

// Inicializar o banco de dados quando este módulo for carregado
setupDatabase().catch(error => {
  console.error('Erro ao configurar o banco de dados:', error);
});
