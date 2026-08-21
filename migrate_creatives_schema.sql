-- ==============================================================================
-- NEXUS AUDIO CORE: Supabase 'creatives' Workspace Table Schema & Backfill Script
-- Run this in your Supabase SQL Editor to ensure full schema alignment
-- ==============================================================================

-- 1. Create the 'creatives' table if it does not already exist
CREATE TABLE IF NOT EXISTS public.creatives (
    id TEXT PRIMARY KEY NOT NULL,
    creator_id TEXT,
    user_id TEXT,
    name TEXT,
    business_name TEXT,
    creative_name TEXT,
    handle TEXT,
    creative_handle TEXT,
    slug TEXT,
    custom_slug TEXT,
    console_handle TEXT,
    category TEXT DEFAULT 'visual',
    primary_category TEXT DEFAULT 'visual',
    secondary_category TEXT,
    specialty TEXT DEFAULT 'visual',
    skills JSONB DEFAULT '[]'::jsonb,
    selected_skills JSONB DEFAULT '[]'::jsonb,
    primary_gear TEXT,
    gear JSONB DEFAULT '[]'::jsonb,
    gear_tags JSONB DEFAULT '[]'::jsonb,
    genres JSONB DEFAULT '[]'::jsonb,
    genre_tags JSONB DEFAULT '[]'::jsonb,
    biography TEXT,
    bio TEXT,
    day_rate TEXT,
    base_rate_value NUMERIC DEFAULT 0,
    base_rate_setup TEXT DEFAULT 'DAY_RATE',
    rate_range TEXT,
    pricing_notes TEXT,
    booking_email TEXT,
    city TEXT,
    state_province TEXT,
    state TEXT,
    country TEXT DEFAULT 'USA',
    base_location TEXT,
    location TEXT,
    portfolio_link TEXT,
    website TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    cover_url TEXT,
    image TEXT,
    image_url TEXT,
    creative_avatar TEXT,
    creative_banner TEXT,
    instagram TEXT,
    artstation TEXT,
    legal_full_name TEXT,
    legal_name TEXT,
    legal_first_name TEXT,
    legal_last_name TEXT,
    legal_entity_type TEXT,
    tax_id TEXT,
    payout_method TEXT,
    stripe_account_id TEXT,
    paypal_email TEXT,
    availability_status TEXT DEFAULT 'Available',
    quick_broadcast TEXT,
    broadcast_bulletin TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Alter existing table to add any missing columns safely
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS creator_id TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS creative_name TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS handle TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS creative_handle TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS custom_slug TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS console_handle TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'visual';
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS primary_category TEXT DEFAULT 'visual';
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS secondary_category TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS specialty TEXT DEFAULT 'visual';
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS selected_skills JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS primary_gear TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS gear JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS gear_tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS genres JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS genre_tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS biography TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS day_rate TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS base_rate_value NUMERIC DEFAULT 0;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS base_rate_setup TEXT DEFAULT 'DAY_RATE';
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS rate_range TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS pricing_notes TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS booking_email TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS state_province TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'USA';
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS base_location TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS portfolio_link TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS creative_avatar TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS creative_banner TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS artstation TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS legal_full_name TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS legal_name TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS legal_first_name TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS legal_last_name TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS legal_entity_type TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS payout_method TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS paypal_email TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'Available';
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS quick_broadcast TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS broadcast_bulletin TEXT;
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.creatives ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 3. Ensure Row-Level Security (RLS) is enabled with permissive access
ALTER TABLE public.creatives ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'creatives' AND policyname = 'Allow public read access to creatives'
    ) THEN
        CREATE POLICY "Allow public read access to creatives" ON public.creatives
            FOR SELECT TO public USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'creatives' AND policyname = 'Allow insert access to creatives'
    ) THEN
        CREATE POLICY "Allow insert access to creatives" ON public.creatives
            FOR INSERT TO public WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'creatives' AND policyname = 'Allow update access to creatives'
    ) THEN
        CREATE POLICY "Allow update access to creatives" ON public.creatives
            FOR UPDATE TO public USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'creatives' AND policyname = 'Allow delete access to creatives'
    ) THEN
        CREATE POLICY "Allow delete access to creatives" ON public.creatives
            FOR DELETE TO public USING (true);
    END IF;
END $$;

-- 4. Create helpful indexes
CREATE INDEX IF NOT EXISTS idx_creatives_creator_id ON public.creatives (creator_id);
CREATE INDEX IF NOT EXISTS idx_creatives_user_id ON public.creatives (user_id);
CREATE INDEX IF NOT EXISTS idx_creatives_handle ON public.creatives (handle);
CREATE INDEX IF NOT EXISTS idx_creatives_category ON public.creatives (category);

-- 5. Backfill/Upsert existing creative data from the profiles table
INSERT INTO public.creatives (
    id,
    creator_id,
    user_id,
    name,
    business_name,
    creative_name,
    handle,
    creative_handle,
    category,
    primary_category,
    specialty,
    skills,
    selected_skills,
    primary_gear,
    gear,
    gear_tags,
    biography,
    bio,
    day_rate,
    base_rate_value,
    base_rate_setup,
    rate_range,
    pricing_notes,
    booking_email,
    city,
    state_province,
    state,
    country,
    base_location,
    location,
    portfolio_link,
    website,
    avatar_url,
    banner_url,
    cover_url,
    image,
    image_url,
    creative_avatar,
    creative_banner,
    instagram,
    artstation,
    payout_method,
    stripe_account_id,
    paypal_email,
    availability_status,
    quick_broadcast,
    broadcast_bulletin,
    created_at,
    updated_at
)
SELECT 
    COALESCE(
        NULLIF(p.creative_id, ''),
        p.id
    ) AS id,
    p.id AS creator_id,
    p.id AS user_id,
    COALESCE(
        NULLIF(p.creative_metadata->>'business_name', ''),
        NULLIF(p.creative_business_name, ''),
        NULLIF(p.creative_name, ''),
        NULLIF(p.name, ''),
        'Creative Studio'
    ) AS name,
    COALESCE(
        NULLIF(p.creative_metadata->>'business_name', ''),
        NULLIF(p.creative_business_name, ''),
        NULLIF(p.creative_name, ''),
        NULLIF(p.name, ''),
        'Creative Studio'
    ) AS business_name,
    COALESCE(
        NULLIF(p.creative_name, ''),
        NULLIF(p.creative_metadata->>'business_name', ''),
        NULLIF(p.creative_business_name, ''),
        NULLIF(p.name, ''),
        'Creative Studio'
    ) AS creative_name,
    COALESCE(
        NULLIF(p.creative_handle, ''),
        p.creative_metadata->>'handle',
        p.console_handle
    ) AS handle,
    COALESCE(
        NULLIF(p.creative_handle, ''),
        p.creative_metadata->>'handle',
        p.console_handle
    ) AS creative_handle,
    COALESCE(
        p.creative_metadata->>'primary_category',
        p.creative_metadata->>'category',
        'visual'
    ) AS category,
    COALESCE(
        p.creative_metadata->>'primary_category',
        p.creative_metadata->>'category',
        'visual'
    ) AS primary_category,
    COALESCE(
        p.creative_metadata->>'specialty',
        p.creative_metadata->>'primary_category',
        'visual'
    ) AS specialty,
    CASE 
        WHEN p.creative_metadata->'selected_skills' IS NOT NULL AND jsonb_typeof(p.creative_metadata->'selected_skills') = 'array'
            THEN p.creative_metadata->'selected_skills'
        WHEN p.creative_metadata->'skills' IS NOT NULL AND jsonb_typeof(p.creative_metadata->'skills') = 'array'
            THEN p.creative_metadata->'skills'
        ELSE '[]'::jsonb
    END AS skills,
    CASE 
        WHEN p.creative_metadata->'selected_skills' IS NOT NULL AND jsonb_typeof(p.creative_metadata->'selected_skills') = 'array'
            THEN p.creative_metadata->'selected_skills'
        WHEN p.creative_metadata->'skills' IS NOT NULL AND jsonb_typeof(p.creative_metadata->'skills') = 'array'
            THEN p.creative_metadata->'skills'
        ELSE '[]'::jsonb
    END AS selected_skills,
    COALESCE(
        p.creative_metadata->>'primary_gear',
        (p.creative_metadata->'gear_tags'->>0)
    ) AS primary_gear,
    CASE 
        WHEN p.creative_metadata->'gear_tags' IS NOT NULL AND jsonb_typeof(p.creative_metadata->'gear_tags') = 'array'
            THEN p.creative_metadata->'gear_tags'
        WHEN p.creative_metadata->'gear' IS NOT NULL AND jsonb_typeof(p.creative_metadata->'gear') = 'array'
            THEN p.creative_metadata->'gear'
        ELSE '[]'::jsonb
    END AS gear,
    CASE 
        WHEN p.creative_metadata->'gear_tags' IS NOT NULL AND jsonb_typeof(p.creative_metadata->'gear_tags') = 'array'
            THEN p.creative_metadata->'gear_tags'
        WHEN p.creative_metadata->'gear' IS NOT NULL AND jsonb_typeof(p.creative_metadata->'gear') = 'array'
            THEN p.creative_metadata->'gear'
        ELSE '[]'::jsonb
    END AS gear_tags,
    COALESCE(
        p.creative_metadata->>'bio',
        p.creative_metadata->>'biography',
        p.bio
    ) AS biography,
    COALESCE(
        p.creative_metadata->>'bio',
        p.creative_metadata->>'biography',
        p.bio
    ) AS bio,
    COALESCE(
        p.creative_metadata->>'day_rate',
        p.creative_metadata->>'base_rate_value',
        '350'
    ) AS day_rate,
    COALESCE(
        CAST(NULLIF(p.creative_metadata->>'day_rate', '') AS NUMERIC),
        CAST(NULLIF(p.creative_metadata->>'base_rate_value', '') AS NUMERIC),
        350
    ) AS base_rate_value,
    COALESCE(
        p.creative_metadata->>'base_rate_setup',
        'DAY_RATE'
    ) AS base_rate_setup,
    CASE 
        WHEN p.creative_metadata->>'day_rate' IS NOT NULL THEN '$' || (p.creative_metadata->>'day_rate') || ' / Day'
        ELSE '$350 / Day'
    END AS rate_range,
    p.creative_metadata->>'pricing_notes' AS pricing_notes,
    COALESCE(
        p.creative_metadata->>'booking_email',
        p.email
    ) AS booking_email,
    p.city AS city,
    p.state_province AS state_province,
    p.state_province AS state,
    COALESCE(p.country, 'USA') AS country,
    COALESCE(
        p.creative_metadata->>'base_location',
        CASE WHEN p.city IS NOT NULL THEN p.city || COALESCE(', ' || p.state_province, '') ELSE NULL END
    ) AS base_location,
    COALESCE(
        p.creative_metadata->>'base_location',
        CASE WHEN p.city IS NOT NULL THEN p.city || COALESCE(', ' || p.state_province, '') ELSE NULL END
    ) AS location,
    COALESCE(
        p.creative_metadata->>'portfolio_link',
        p.website
    ) AS portfolio_link,
    COALESCE(
        p.creative_metadata->>'portfolio_link',
        p.website
    ) AS website,
    COALESCE(
        p.creative_avatar,
        p.avatar_url
    ) AS avatar_url,
    COALESCE(
        p.creative_banner,
        p.banner_url
    ) AS banner_url,
    COALESCE(
        p.creative_banner,
        p.banner_url
    ) AS cover_url,
    COALESCE(
        p.creative_avatar,
        p.avatar_url
    ) AS image,
    COALESCE(
        p.creative_avatar,
        p.avatar_url
    ) AS image_url,
    COALESCE(
        p.creative_avatar,
        p.avatar_url
    ) AS creative_avatar,
    COALESCE(
        p.creative_banner,
        p.banner_url
    ) AS creative_banner,
    p.creative_metadata->>'instagram' AS instagram,
    p.creative_metadata->>'artstation' AS artstation,
    COALESCE(p.creative_metadata->>'payout_method', 'stripe') AS payout_method,
    p.creative_metadata->>'stripe_account_id' AS stripe_account_id,
    p.creative_metadata->>'paypal_email' AS paypal_email,
    COALESCE(p.creative_metadata->>'availability_status', 'Available') AS availability_status,
    p.creative_metadata->>'quick_broadcast' AS quick_broadcast,
    p.creative_metadata->>'broadcast_bulletin' AS broadcast_bulletin,
    COALESCE(p.created_at, timezone('utc'::text, now())) AS created_at,
    timezone('utc'::text, now()) AS updated_at
FROM public.profiles p
WHERE 
    p.creative_id IS NOT NULL 
    OR p.creative_business_name IS NOT NULL
    OR p.creative_name IS NOT NULL
    OR p.creative_metadata IS NOT NULL
    OR (p.allowed_workspaces IS NOT NULL AND p.allowed_workspaces::text ILIKE '%creative%')
    OR (p.registered_workspaces IS NOT NULL AND p.registered_workspaces::text ILIKE '%creative%')
ON CONFLICT (id) DO UPDATE SET
    creator_id = EXCLUDED.creator_id,
    user_id = EXCLUDED.user_id,
    name = COALESCE(EXCLUDED.name, public.creatives.name),
    business_name = COALESCE(EXCLUDED.business_name, public.creatives.business_name),
    creative_name = COALESCE(EXCLUDED.creative_name, public.creatives.creative_name),
    handle = COALESCE(EXCLUDED.handle, public.creatives.handle),
    creative_handle = COALESCE(EXCLUDED.creative_handle, public.creatives.creative_handle),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.creatives.avatar_url),
    banner_url = COALESCE(EXCLUDED.banner_url, public.creatives.banner_url),
    creative_avatar = COALESCE(EXCLUDED.creative_avatar, public.creatives.creative_avatar),
    creative_banner = COALESCE(EXCLUDED.creative_banner, public.creatives.creative_banner),
    updated_at = timezone('utc'::text, now());
