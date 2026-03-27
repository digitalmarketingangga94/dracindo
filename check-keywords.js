import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

async function checkKeywords() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('key', 'active_keywords')
    .single();
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Data:', data);
  }
}

checkKeywords();
