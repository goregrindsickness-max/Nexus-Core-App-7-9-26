import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://s6jhaejrxpqgkdr7esx5hy.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (supabaseUrl && supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  supabase.from('nexus_posts').select('*').limit(2).then(({ data, error }) => {
    if (error) {
      console.error('Error fetching nexus_posts:', error);
    } else {
      console.log('Sample nexus_posts data:', data);
    }
  });
}
