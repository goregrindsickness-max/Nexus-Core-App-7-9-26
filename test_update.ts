import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function run() {
  const { data, error } = await supabase.from('nexus_posts').update({ content: '__DELETED__' }).eq('id', 'fc54d46b-4ecd-4794-884b-e2751c1ab561');
  console.log("Update result:", { error, data });
}
run();
