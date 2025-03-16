
import { supabase } from '../integrations/supabase/client';
import { verifyAndCreateBuckets } from './admin-activity-logger';

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
