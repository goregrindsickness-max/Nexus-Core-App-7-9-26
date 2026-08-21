import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(url, anonKey);

async function inspectTable() {
  console.log('Inspecting columns for nexus_chats using RPC inspect_table_columns...');
  const { data, error } = await supabase.rpc('inspect_table_columns', { target_table: 'nexus_chats' });
  if (error) {
    console.error('RPC failed:', error);
  } else {
    console.log('Columns list:', data);
  }
}

inspectTable();
