
import { supabase } from '../integrations/supabase/client';
import { verifyAndCreateBuckets } from './admin-activity-logger';
import { Json } from '../integrations/supabase/types';

// Configuração global - verifica e configura o banco de dados
export const setupDatabase = async (): Promise<boolean> => {
  try {
    // Verifica a conexão com o Supabase
    const { error: connectionError } = await supabase.from('site_info').select('count', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error("Erro de conexão com Supabase:", connectionError);
      return false;
    }
    
    // Verifica e cria os buckets necessários
    const bucketsSetup = await verifyAndCreateBuckets();
    if (!bucketsSetup) {
      return false;
    }
    
    console.log("Configuração do banco de dados concluída com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao configurar o banco de dados:", error);
    return false;
  }
};

/**
 * Faz upload de uma imagem para o bucket especificado
 */
export const uploadImage = async (file: File, bucketName: string = 'site_images', prefix: string = ''): Promise<string> => {
  try {
    // Verifica se o banco de dados está configurado
    await setupDatabase();
    
    // Gera um nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${prefix}${Date.now()}.${fileExt}`;
    const filePath = prefix ? fileName : fileName;
    
    // Upload da imagem
    const { error: uploadError, data } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error(`Erro ao fazer upload para ${bucketName}:`, uploadError);
      throw uploadError;
    }
    
    // Obter URL pública da imagem
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error(`Erro durante upload para ${bucketName}:`, error);
    throw error;
  }
};

/**
 * Salva informações do site
 */
export const saveSiteInfo = async (siteInfo: any): Promise<boolean> => {
  try {
    // Verificar se já existe um registro
    const { data: existingData, error: fetchError } = await supabase
      .from('site_info')
      .select('id')
      .limit(1);
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Erro ao verificar site_info existente:', fetchError);
      throw fetchError;
    }
    
    let result;
    if (existingData && existingData.length > 0) {
      // Atualiza registro existente
      result = await supabase
        .from('site_info')
        .update(siteInfo)
        .eq('id', existingData[0].id);
    } else {
      // Insere novo registro
      result = await supabase
        .from('site_info')
        .insert(siteInfo);
    }
    
    if (result.error) {
      console.error('Erro ao salvar informações do site:', result.error);
      throw result.error;
    }
    
    return true;
  } catch (error) {
    console.error('Falha ao salvar informações do site:', error);
    return false;
  }
};

/**
 * Obtém imagens do carrossel
 */
export const getCarouselImages = async (): Promise<string[]> => {
  try {
    // Tenta obter imagens do banco de dados primeiro
    const { data: siteInfo, error: dbError } = await supabase
      .from('site_info')
      .select('carousel_images')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (!dbError && siteInfo && siteInfo.carousel_images) {
      // Se encontrou no banco, retorna as imagens
      let images = siteInfo.carousel_images;
      if (typeof images === 'string') {
        try {
          images = JSON.parse(images);
        } catch (e) {
          images = [images];
        }
      }
      
      // Garantir que todos os valores são strings
      return Array.isArray(images) ? images.map(item => String(item)) : [];
    }
    
    // Se não encontrou no banco ou teve erro, tenta listar imagens do bucket
    const { data: listData, error: listError } = await supabase.storage
      .from('site_images')
      .list('site/', {
        limit: 10,
        sortBy: { column: 'name', order: 'desc' }
      });
    
    if (listError) {
      console.error('Erro ao listar imagens do bucket:', listError);
      return [];
    }
    
    // Filtrar apenas arquivos (não pastas) e criar URLs públicas
    const imageFiles = listData
      .filter(item => !item.id.endsWith('/'))
      .map(item => {
        const { data } = supabase.storage
          .from('site_images')
          .getPublicUrl(`site/${item.name}`);
        return data.publicUrl;
      });
    
    return imageFiles;
  } catch (error) {
    console.error('Erro ao obter imagens do carrossel:', error);
    return [];
  }
};
