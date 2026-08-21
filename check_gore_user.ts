import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://s6jhaejrxpqgkdr7esx5hy.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (supabaseUrl && supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  supabase.from('profiles').select('*').eq('email', 'goregrindsickness@gmail.com').then(({ data, error }) => {
    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      console.log('Goregrind user profile:', data);
    }
  });
}
