import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: profiles, error } = await supabase.from('profiles').select('id, email, full_name');
  if (error) {
    console.error("Error fetching profiles:", error);
  } else {
    console.log(`Total profiles: ${profiles.length}`);
    console.log("Profiles list:", profiles);
  }
}
run();
