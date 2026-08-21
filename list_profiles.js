import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data } = await supabase.from('profiles').select('*');
  for (const p of data) {
    console.log(`- ${p.id}: ${p.full_name} / ${p.console_handle} / ${p.email}`);
  }
}
run();
