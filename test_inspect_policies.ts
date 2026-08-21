import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(url, anonKey);

async function listProfiles() {
  console.log('Fetching profiles...');
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, banner_url');
    
  if (error) {
    console.error('Failed to fetch profiles:', error);
  } else {
    console.log('Profiles found:', data?.length);
    for (const p of data || []) {
      console.log(`Profile: id=${p.id}, email=${p.email}, full_name=${p.full_name}, avatar=${p.avatar_url}, banner=${p.banner_url}`);
    }
  }
}

listProfiles();
