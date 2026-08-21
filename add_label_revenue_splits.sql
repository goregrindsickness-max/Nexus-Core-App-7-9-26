-- 1. ARCHITECT THE LABEL PARENT-CHILD SCHEMA

-- Create labels table
CREATE TABLE IF NOT EXISTS public.labels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    contact_email TEXT,
    payout_routing_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add label_id to bands (artist_profiles counterpart)
ALTER TABLE public.bands 
ADD COLUMN IF NOT EXISTS label_id UUID REFERENCES public.labels(id) ON DELETE SET NULL;

-- Create owner_type enum
DO $$ BEGIN
    CREATE TYPE owner_type_enum AS ENUM ('ARTIST', 'LABEL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create missing music_tracks table
CREATE TABLE IF NOT EXISTS public.music_tracks (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    duration TEXT,
    "fileType" TEXT,
    band_id TEXT,
    owner_type owner_type_enum DEFAULT 'ARTIST',
    owner_id TEXT,
    track_preview_mode TEXT CHECK (track_preview_mode IN ('30_SEC_CLIP', 'FULL_STREAM', 'LOCKED')) DEFAULT '30_SEC_CLIP',
    track_price NUMERIC(10, 2) DEFAULT 1.00,
    track_visibility BOOLEAN DEFAULT true
);

-- Add columns to inventory (representing distro_store_items)
ALTER TABLE public.inventory 
ADD COLUMN IF NOT EXISTS owner_type owner_type_enum DEFAULT 'ARTIST',
ADD COLUMN IF NOT EXISTS owner_id TEXT;

-- 2. IMPLEMENT THE REVENUE SPLIT LEDGER SCHEMA
CREATE TABLE IF NOT EXISTS public.asset_revenue_splits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id TEXT NOT NULL, -- references music or merch items
    label_percentage NUMERIC(5, 4) NOT NULL,
    artist_percentage NUMERIC(5, 4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_percentage_sum CHECK (label_percentage + artist_percentage = 1.0000)
);

-- Create ledger_entries table
CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id TEXT PRIMARY KEY,
    sale_id TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payout_target_id TEXT NOT NULL,
    payout_target_type owner_type_enum NOT NULL,
    split_percentage NUMERIC(5, 4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
