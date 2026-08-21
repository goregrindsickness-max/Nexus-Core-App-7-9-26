import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error(error);
    return;
  }
  for (const p of data) {
    console.log(`- ${p.id}: ${p.name} / ${p.console_handle} / ${p.email}`);
  }
  
  const toDelete = data.filter(p => p.console_handle === 'bdmCEO' || p.name === 'bdmCEO');
  for (const p of toDelete) {
    console.log("Deleting:", p.id);
    await supabase.from('profiles').delete().eq('id', p.id);
  }
}
run();
