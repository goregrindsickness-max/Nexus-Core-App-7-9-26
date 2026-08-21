-- SQL to update nexus_stories
ALTER TABLE nexus_stories
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS video TEXT,
ADD COLUMN IF NOT EXISTS music TEXT,
ADD COLUMN IF NOT EXISTS textOverlay TEXT,
ADD COLUMN IF NOT EXISTS textStyle TEXT,
ADD COLUMN IF NOT EXISTS textColorHex TEXT,
ADD COLUMN IF NOT EXISTS stickers JSONB,
ADD COLUMN IF NOT EXISTS textSize NUMERIC,
ADD COLUMN IF NOT EXISTS textX NUMERIC,
ADD COLUMN IF NOT EXISTS textY NUMERIC,
ADD COLUMN IF NOT EXISTS stickerScale NUMERIC,
ADD COLUMN IF NOT EXISTS stickerX NUMERIC,
ADD COLUMN IF NOT EXISTS stickerY NUMERIC,
ADD COLUMN IF NOT EXISTS border TEXT,
ADD COLUMN IF NOT EXISTS textColor TEXT;

-- SQL to create nexus_events
CREATE TABLE IF NOT EXISTS nexus_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    venue TEXT NOT NULL,
    headliner TEXT NOT NULL,
    time TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SQL to create nexus_setlists
CREATE TABLE IF NOT EXISTS nexus_setlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    band_name TEXT NOT NULL,
    tracks JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and add basic policies
ALTER TABLE nexus_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_setlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON nexus_events FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON nexus_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON nexus_setlists FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON nexus_setlists FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- SQL to create nexus_tracks
CREATE TABLE IF NOT EXISTS nexus_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    band TEXT NOT NULL,
    album TEXT NOT NULL,
    duration TEXT NOT NULL,
    cover_art TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SQL to create nexus_shop_items
CREATE TABLE IF NOT EXISTS nexus_shop_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    category TEXT NOT NULL,
    condition TEXT,
    description TEXT,
    seller TEXT NOT NULL,
    fallback_thumbnail TEXT,
    is_user_listed BOOLEAN DEFAULT true,
    brand_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE nexus_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_shop_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON nexus_tracks FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON nexus_tracks FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON nexus_shop_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON nexus_shop_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- SQL to create nexus_venue_chat (for persisting venue messages)
CREATE TABLE IF NOT EXISTS nexus_venue_chat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SQL to create nexus_reactions (for persisting post/story reactions)
CREATE TABLE IF NOT EXISTS nexus_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL,
    item_type TEXT NOT NULL DEFAULT 'post',
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(item_id, profile_id, reaction_type)
);

-- Enable RLS
ALTER TABLE nexus_venue_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_reactions ENABLE ROW LEVEL SECURITY;

-- SQL to create shop_merch table (Source of Truth for Merch items)
CREATE TABLE IF NOT EXISTS public.shop_merch (
    id TEXT PRIMARY KEY DEFAULT ('merch_' || extract(epoch from now())::bigint || '_' || lower(hex_to_string(encode(gen_random_bytes(4), 'hex')))),
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

-- Enable RLS and add public read/write access policies
ALTER TABLE public.shop_merch ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.shop_merch FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.shop_merch FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.shop_merch FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.shop_merch FOR DELETE USING (true);

-- Storage bucket policy helper for shop-merch
INSERT INTO storage.buckets (id, name, public) 
VALUES ('shop-merch', 'shop-merch', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public Read Access for shop-merch Bucket" 
ON storage.objects FOR SELECT USING (bucket_id = 'shop-merch');

CREATE POLICY "Public Upload Access for shop-merch Bucket" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'shop-merch');

-- Storage bucket for audio-vault (Master Lossless WAV/MP3 recordings)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio-vault', 'audio-vault', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public Read Access for audio-vault Bucket" 
ON storage.objects FOR SELECT USING (bucket_id = 'audio-vault');

CREATE POLICY "Public Upload Access for audio-vault Bucket" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'audio-vault');

-- SQL to create releases table for Digital & Physical Master Catalog
CREATE TABLE IF NOT EXISTS public.releases (
    id TEXT PRIMARY KEY NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    band_id TEXT NOT NULL,
    label_id UUID,
    title TEXT NOT NULL,
    catalog_id TEXT,
    type TEXT DEFAULT 'Album',
    release_date TEXT,
    label TEXT,
    genre TEXT,
    cover_image TEXT,
    cover_url TEXT,
    cover_color TEXT,
    tracks JSONB DEFAULT '[]'::jsonb,
    formats JSONB DEFAULT '{}'::jsonb,
    digital JSONB DEFAULT '[]'::jsonb,
    audio_vault_path TEXT,
    status TEXT DEFAULT 'active',
    created_by TEXT
);

CREATE INDEX IF NOT EXISTS "idx_releases_band_id" ON public.releases ("band_id");
CREATE INDEX IF NOT EXISTS "idx_releases_catalog_id" ON public.releases ("catalog_id");
CREATE INDEX IF NOT EXISTS "idx_releases_created_at" ON public.releases ("created_at");

ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.releases FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.releases FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.releases FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.releases FOR DELETE USING (true);


