import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(url, anonKey);

async function bruteForceColumns() {
  const commonNames = ['id', 'created_at', 'data', 'messages', 'payload', 'content', 'chat_data', 'history', 'chats', 'metadata', 'json_data', 'threads'];
  for (const name of commonNames) {
    const { error } = await supabase.from('nexus_chats').select(name).limit(1);
    if (!error) {
      console.log(`🟢 SUCCESS: Column "${name}" exists on "nexus_chats"!`);
    } else {
      console.log(`🔴 ERROR for column "${name}":`, error.message);
    }
  }
}

bruteForceColumns();
