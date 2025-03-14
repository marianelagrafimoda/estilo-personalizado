
import { createClient } from '@supabase/supabase-js';

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
