import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env
const env = fs.readFileSync(path.resolve('.env'), 'utf-8');
let supabaseUrl = '';
let supabaseKey = '';

env.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('nexus_chats').select('*');
  console.log('Error:', error);
  console.log('Data count:', data?.length);
  if (data && data.length > 0) {
    console.log('Sample:', data.slice(0, 5));
  }
}
run();
