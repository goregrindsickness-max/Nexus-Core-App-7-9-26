import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const res = await supabase.from('profiles').upsert({
    id: '62e55063-57b0-417e-b03d-aadade65ea41',
    full_name: 'Miguel Goregrinder Medina',
    console_handle: 'bdmCEO',
    email: 'goregrindsickness@gmail.com',
    account_type: 'industry_pro',
    role: 'Industry Pro',
    avatar_url: '/Miguel Art Deco.png',
    allowed_workspaces: ['creative', 'promoter', 'band', 'label', 'industry_pro', 'fan_only']
  });
  console.log("Restored:", res);
}
run();
