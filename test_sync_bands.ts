import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('--- Table Check ---');
const supabase = createClient(url, anonKey);

const tables = [
  'bands', 'band', 'profiles', 'profile', 'shows', 'show', 'labels', 'label', 'venues', 'venue'
];

async function check() {
  for (const t of tables) {
    const { error, status } = await supabase.from(t).select('id').limit(1);
    if (error) {
      console.log(`Table '${t}': Status ${status}, Error: ${error.message} (Code: ${error.code})`);
    } else {
      console.log(`Table '${t}': Status ${status}, SUCCESS!`);
    }
  }
}

check();
