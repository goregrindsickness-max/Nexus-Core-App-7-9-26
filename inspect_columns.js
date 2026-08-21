import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.rpc('inspect_columns', { table_name: 'profiles' });
  if (error) {
    // If inspect_columns RPC doesn't exist, let's do a select * on profiles and print all keys of the first row
    console.warn("RPC inspect_columns failed, selecting first row of profiles...");
    const { data: rows, error: selectErr } = await supabase.from('profiles').select('*').limit(1);
    if (selectErr) {
      console.error("Select failed:", selectErr);
    } else if (rows && rows.length > 0) {
      console.log("Columns from first row:", Object.keys(rows[0]));
    } else {
      console.log("No rows in profiles table to inspect");
    }
  } else {
    console.log("Columns from inspect_columns:", data);
  }
}
run();
