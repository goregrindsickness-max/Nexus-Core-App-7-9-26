import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(url, anonKey);

async function inspectColumns() {
  console.log('Querying schema for nexus_chats...');
  // Let's do a raw RPC or request a dummy row or select from information_schema via RPC if possible
  // Wait, let's try querying information_schema.columns using standard select if allowed,
  // or we can select a single row from nexus_chats and see the returned keys.
  const { data, error } = await supabase
    .from('nexus_chats')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error selecting:', error);
  } else {
    console.log('Select returned:', data);
  }
}

inspectColumns();
