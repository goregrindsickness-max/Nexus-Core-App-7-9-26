import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

async function run() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const sql = `
    GRANT ALL PRIVILEGES ON TABLE public.follows TO anon;
    GRANT ALL PRIVILEGES ON TABLE public.follows TO authenticated;
    GRANT ALL PRIVILEGES ON TABLE public.follows TO service_role;
    
    DROP POLICY IF EXISTS "Allow public insert of follows" ON public.follows;
    CREATE POLICY "Allow public insert of follows" ON public.follows FOR INSERT TO public WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public delete of follows" ON public.follows;
    CREATE POLICY "Allow public delete of follows" ON public.follows FOR DELETE TO public USING (true);
  `;
  
  console.log("Running SQL via execute_sql RPC...");
  const { data, error } = await supabase.rpc('execute_sql', { sql_statement: sql });
  if (error) {
    console.error("Error executing SQL via RPC:", error);
  } else {
    console.log("SQL executed successfully! Result:", data);
  }
}

run();
