
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
    
    // Just log whether the buckets exist - we'll create them through SQL migrations
    if (!existingBuckets.has('site_images')) {
      console.log('site_images bucket needs to be created via SQL migration');
    } else {
      console.log('site_images bucket already exists');
    }
    
    if (!existingBuckets.has('product_images')) {
      console.log('product_images bucket needs to be created via SQL migration');
    } else {
      console.log('product_images bucket already exists');
    }
    
    console.log('Database setup completed');
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
  }
};

// Function to upload images to storage bucket
export const uploadImage = async (file: File, bucket: string = 'site_images', path: string = 'products/') => {
  try {
    // Check if the bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucket);
    
    if (!bucketExists) {
      console.error(`Bucket ${bucket} does not exist`);
      throw new Error(`Para subir imágenes, contacte con el administrador del sistema para crear el bucket ${bucket}.`);
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
      console.error('Error uploading image:', error);
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
    console.error('Error in uploadImage:', error);
    throw error;
  }
};

// Function to fetch all carousel images
export const getCarouselImages = async () => {
  try {
    // Check if the bucket exists
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
    
    // Convert filenames to public URLs
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

// Function to save site info
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

// Ensure setupDatabase runs when this module loads
setupDatabase().catch(console.error);
