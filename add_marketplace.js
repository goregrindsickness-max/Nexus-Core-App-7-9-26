import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addMarketplaceTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS public.user_marketplace_items (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      price NUMERIC(10, 2) NOT NULL,
      image_url TEXT,
      condition TEXT,
      size TEXT,
      type TEXT DEFAULT 'merch',
      is_sold BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Allow public read access
    ALTER TABLE public.user_marketplace_items ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Public can view marketplace items" ON public.user_marketplace_items;
    CREATE POLICY "Public can view marketplace items" ON public.user_marketplace_items FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Users can insert own marketplace items" ON public.user_marketplace_items;
    CREATE POLICY "Users can insert own marketplace items" ON public.user_marketplace_items FOR INSERT WITH CHECK (auth.uid() = seller_id);
    
    DROP POLICY IF EXISTS "Users can update own marketplace items" ON public.user_marketplace_items;
    CREATE POLICY "Users can update own marketplace items" ON public.user_marketplace_items FOR UPDATE USING (auth.uid() = seller_id);
    
    DROP POLICY IF EXISTS "Users can delete own marketplace items" ON public.user_marketplace_items;
    CREATE POLICY "Users can delete own marketplace items" ON public.user_marketplace_items FOR DELETE USING (auth.uid() = seller_id);
  `;

  // We can't execute raw SQL via client directly unless we have an RPC, 
  // but let's check if there's a migration endpoint or we just create it in supabase-schema.sql
  
  console.log("SQL to execute:\\n", sql);
}

addMarketplaceTable();
