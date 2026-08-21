import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://s6jhaejrxpqgkdr7esx5hy-148981064113.us-west2.run.app';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'fake';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('creatives').select('*').limit(1);
  console.log('creatives table:', error ? error.message : 'exists');
}
check();
