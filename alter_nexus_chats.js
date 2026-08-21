import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in process.env");
  process.exit(1);
}

async function run() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const sql = `
    ALTER TABLE public."nexus_chats" ADD COLUMN IF NOT EXISTS "sender_id" TEXT;
    ALTER TABLE public."nexus_chats" ADD COLUMN IF NOT EXISTS "receiver_id" TEXT;
    ALTER TABLE public."nexus_chats" ADD COLUMN IF NOT EXISTS "recipient_id" TEXT;
    ALTER TABLE public."nexus_chats" ADD COLUMN IF NOT EXISTS "message" TEXT;
    ALTER TABLE public."nexus_chats" ADD COLUMN IF NOT EXISTS "content" TEXT;
    ALTER TABLE public."nexus_chats" ADD COLUMN IF NOT EXISTS "is_read" BOOLEAN DEFAULT false;
  `;
  
  const { data, error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    console.error("Error executing SQL via RPC:", error);
  } else {
    console.log("SQL executed successfully", data);
  }
}
run();
