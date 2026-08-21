-- =========================================================================
-- Supabase SQL Migration Script for `shop_merch` & `shop-merch` Bucket
-- =========================================================================

-- 1. Enable extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create `shop_merch` Table
CREATE TABLE IF NOT EXISTS public.shop_merch (
    id TEXT PRIMARY KEY DEFAULT ('merch_' || extract(epoch from now())::bigint),
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    category TEXT DEFAULT 'OFFICIAL MERCH DROP',
    condition TEXT DEFAULT 'New',
    description TEXT,
    sizes TEXT[] DEFAULT ARRAY['Small (S)', 'Medium (M)', 'Large (L)', 'Extra Large (XL)', '2X-Large (2XL)'],
    thumbnail TEXT,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    stock INT DEFAULT 25,
    is_timed BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    duration_hours NUMERIC,
    seller_id TEXT,
    seller_name TEXT DEFAULT 'Nexus Merchant',
    allow_negotiation BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.shop_merch ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for `shop_merch`
DROP POLICY IF EXISTS "Enable read access for all users" ON public.shop_merch;
CREATE POLICY "Enable read access for all users" 
ON public.shop_merch FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON public.shop_merch;
CREATE POLICY "Enable insert for all users" 
ON public.shop_merch FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON public.shop_merch;
CREATE POLICY "Enable update for all users" 
ON public.shop_merch FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON public.shop_merch;
CREATE POLICY "Enable delete for all users" 
ON public.shop_merch FOR DELETE USING (true);

-- 5. Set up `shop-merch` Storage Bucket & RLS Policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('shop-merch', 'shop-merch', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Read Access for shop-merch Bucket" ON storage.objects;
CREATE POLICY "Public Read Access for shop-merch Bucket" 
ON storage.objects FOR SELECT USING (bucket_id = 'shop-merch');

DROP POLICY IF EXISTS "Public Upload Access for shop-merch Bucket" ON storage.objects;
CREATE POLICY "Public Upload Access for shop-merch Bucket" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'shop-merch');

DROP POLICY IF EXISTS "Public Update Access for shop-merch Bucket" ON storage.objects;
CREATE POLICY "Public Update Access for shop-merch Bucket" 
ON storage.objects FOR UPDATE USING (bucket_id = 'shop-merch');
