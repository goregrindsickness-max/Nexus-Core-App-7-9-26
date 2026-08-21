-- ==============================================================================
-- NEXUS CORE: Complete Cleanup, Schema Consolidation & Refresh for 'creatives'
-- Run this script in your Supabase SQL Editor.
-- 
-- Summary of Changes:
-- 1. category -> primary_category & primary_skill
-- 2. secondary_category -> secondary_category & secondary_skill
-- 3. Dropped booking_email
-- 4. Dropped base_location (location auto-compiled from city, state_province, country)
-- 5. Added live_update_ticker
-- 6. genres aligned as canonical JSONB taxonomy array
-- ==============================================================================

-- STEP 1: Create a temporary backup table with all existing data
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'creatives') THEN
        DROP TABLE IF EXISTS public._creatives_cleanup_backup CASCADE;
        CREATE TABLE public._creatives_cleanup_backup AS SELECT * FROM public.creatives;
        RAISE NOTICE '✓ Backed up existing creatives records to public._creatives_cleanup_backup';
    END IF;
END $$;

-- STEP 2: Drop the old creatives table to eliminate all orphan/duplicate columns
DROP TABLE IF EXISTS public.creatives CASCADE;

-- STEP 3: Recreate the clean canonical 'creatives' table
CREATE TABLE public.creatives (
    id TEXT PRIMARY KEY NOT NULL,
    creator_id TEXT,
    user_id TEXT,
    business_name TEXT DEFAULT 'Creative Studio',
    creative_handle TEXT DEFAULT 'creative_pro',
    primary_category TEXT DEFAULT 'GRAPHIC_DESIGN',
    primary_skill TEXT DEFAULT 'MERCH_DESIGN',
    secondary_category TEXT,
    secondary_skill TEXT,
    skills JSONB DEFAULT '[]'::jsonb,
    gear JSONB DEFAULT '[]'::jsonb,
    genres JSONB DEFAULT '[]'::jsonb,
    bio TEXT,
    day_rate TEXT DEFAULT '350',
    pricing_notes TEXT,
    city TEXT,
    state_province TEXT,
    country TEXT DEFAULT 'USA',
    portfolio_link TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    instagram TEXT,
    artstation TEXT,
    top_song_title TEXT,
    top_song_artist TEXT,
    top_song_url TEXT,
    live_update_ticker TEXT,
    broadcast_bulletin TEXT,
    availability_status TEXT DEFAULT 'Available',
    payout_method TEXT DEFAULT 'stripe',
    stripe_account_id TEXT,
    paypal_email TEXT,
    tax_id TEXT,
    legal_name TEXT,
    legal_entity_type TEXT DEFAULT 'sole_proprietorship',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- STEP 4: Restore and consolidate data from backup (if backup exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = '_creatives_cleanup_backup') THEN
        INSERT INTO public.creatives (
            id,
            creator_id,
            user_id,
            business_name,
            creative_handle,
            primary_category,
            primary_skill,
            secondary_category,
            secondary_skill,
            skills,
            gear,
            genres,
            bio,
            day_rate,
            pricing_notes,
            city,
            state_province,
            country,
            portfolio_link,
            avatar_url,
            banner_url,
            instagram,
            artstation,
            top_song_title,
            top_song_artist,
            top_song_url,
            live_update_ticker,
            broadcast_bulletin,
            availability_status,
            payout_method,
            stripe_account_id,
            paypal_email,
            tax_id,
            legal_name,
            legal_entity_type,
            created_at,
            updated_at
        )
        SELECT
            (j->>'id') AS id,
            COALESCE(j->>'creator_id', j->>'user_id', j->>'id') AS creator_id,
            COALESCE(j->>'user_id', j->>'creator_id', j->>'id') AS user_id,
            COALESCE(j->>'business_name', j->>'creative_name', j->>'name', 'Creative Studio') AS business_name,
            COALESCE(j->>'creative_handle', j->>'handle', j->>'console_handle', 'creative_pro') AS creative_handle,
            COALESCE(j->>'primary_category', j->>'category', j->>'specialty', 'GRAPHIC_DESIGN') AS primary_category,
            COALESCE(j->>'primary_skill', j->'skills'->>0, j->'selected_skills'->>0, 'MERCH_DESIGN') AS primary_skill,
            j->>'secondary_category' AS secondary_category,
            COALESCE(j->>'secondary_skill', j->'skills'->>1, j->'selected_skills'->>1) AS secondary_skill,
            COALESCE(
                CASE WHEN jsonb_typeof(j->'skills') = 'array' THEN j->'skills'
                     WHEN jsonb_typeof(j->'selected_skills') = 'array' THEN j->'selected_skills'
                     ELSE '[]'::jsonb END,
                '[]'::jsonb
            ) AS skills,
            COALESCE(
                CASE WHEN jsonb_typeof(j->'gear') = 'array' THEN j->'gear'
                     WHEN jsonb_typeof(j->'gear_tags') = 'array' THEN j->'gear_tags'
                     WHEN (j->>'primary_gear') IS NOT NULL THEN jsonb_build_array(j->>'primary_gear')
                     ELSE '[]'::jsonb END,
                '[]'::jsonb
            ) AS gear,
            COALESCE(
                CASE WHEN jsonb_typeof(j->'genres') = 'array' THEN j->'genres'
                     WHEN jsonb_typeof(j->'genre_tags') = 'array' THEN j->'genre_tags'
                     WHEN jsonb_typeof(j->'micro_genres') = 'array' THEN j->'micro_genres'
                     ELSE '[]'::jsonb END,
                '[]'::jsonb
            ) AS genres,
            COALESCE(j->>'bio', j->>'biography') AS bio,
            COALESCE(j->>'day_rate', j->>'base_rate_value', '350') AS day_rate,
            j->>'pricing_notes' AS pricing_notes,
            j->>'city' AS city,
            COALESCE(j->>'state_province', j->>'state') AS state_province,
            COALESCE(j->>'country', 'USA') AS country,
            COALESCE(j->>'portfolio_link', j->>'website') AS portfolio_link,
            COALESCE(j->>'avatar_url', j->>'creative_avatar', j->>'image', j->>'image_url') AS avatar_url,
            COALESCE(j->>'banner_url', j->>'creative_banner', j->>'cover_url') AS banner_url,
            j->>'instagram' AS instagram,
            j->>'artstation' AS artstation,
            COALESCE(j->>'top_song_title', j->>'highlight_track_title', j->>'favoriteSong') AS top_song_title,
            COALESCE(j->>'top_song_artist', j->>'highlight_track_artist') AS top_song_artist,
            COALESCE(j->>'top_song_url', j->>'featured_youtube_url', j->>'highlight_track_url') AS top_song_url,
            COALESCE(j->>'live_update_ticker', j->>'broadcast_bulletin', j->>'initial_broadcast_bulletin', j->>'inital_broadcast_bulletin', j->>'quick_broadcast') AS live_update_ticker,
            COALESCE(j->>'broadcast_bulletin', j->>'live_update_ticker', j->>'initial_broadcast_bulletin', j->>'inital_broadcast_bulletin', j->>'quick_broadcast') AS broadcast_bulletin,
            COALESCE(j->>'availability_status', 'Available') AS availability_status,
            COALESCE(j->>'payout_method', 'stripe') AS payout_method,
            j->>'stripe_account_id' AS stripe_account_id,
            j->>'paypal_email' AS paypal_email,
            j->>'tax_id' AS tax_id,
            COALESCE(j->>'legal_name', j->>'legal_full_name') AS legal_name,
            COALESCE(j->>'legal_entity_type', 'sole_proprietorship') AS legal_entity_type,
            COALESCE(
                CASE WHEN j->>'created_at' IS NOT NULL THEN (j->>'created_at')::timestamptz ELSE NULL END,
                timezone('utc'::text, now())
            ) AS created_at,
            timezone('utc'::text, now()) AS updated_at
        FROM (
            SELECT to_jsonb(b) AS j
            FROM public._creatives_cleanup_backup b
        ) sub
        WHERE (j->>'id') IS NOT NULL
        ON CONFLICT (id) DO NOTHING;

        RAISE NOTICE '✓ Restored and consolidated data from backup into canonical creatives table';
        
        -- Drop backup table
        DROP TABLE IF EXISTS public._creatives_cleanup_backup CASCADE;
    END IF;
END $$;

-- STEP 5: Enable Row Level Security (RLS) and grant permissions
ALTER TABLE public.creatives ENABLE ROW LEVEL SECURITY;

-- Allow public read access to creatives directory
DROP POLICY IF EXISTS "Allow public read access on creatives" ON public.creatives;
CREATE POLICY "Allow public read access on creatives"
    ON public.creatives FOR SELECT
    USING (true);

-- Allow authenticated and anon full CRUD operations for app operation
DROP POLICY IF EXISTS "Allow authenticated insert on creatives" ON public.creatives;
CREATE POLICY "Allow authenticated insert on creatives"
    ON public.creatives FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update on creatives" ON public.creatives;
CREATE POLICY "Allow authenticated update on creatives"
    ON public.creatives FOR UPDATE
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated delete on creatives" ON public.creatives;
CREATE POLICY "Allow authenticated delete on creatives"
    ON public.creatives FOR DELETE
    USING (true);

-- Grant table privileges
GRANT ALL ON TABLE public.creatives TO authenticated;
GRANT ALL ON TABLE public.creatives TO anon;
GRANT ALL ON TABLE public.creatives TO service_role;

-- STEP 6: Helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_creatives_creator_id ON public.creatives(creator_id);
CREATE INDEX IF NOT EXISTS idx_creatives_user_id ON public.creatives(user_id);
CREATE INDEX IF NOT EXISTS idx_creatives_primary_category ON public.creatives(primary_category);
CREATE INDEX IF NOT EXISTS idx_creatives_primary_skill ON public.creatives(primary_skill);
