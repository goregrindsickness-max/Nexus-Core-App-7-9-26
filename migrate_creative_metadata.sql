-- ==============================================================================
-- NEXUS AUDIO CORE: Data Migration Script
-- Purpose: Move creative profile specifications from profiles.creative_metadata 
--          (and profiles table columns) directly into the dedicated 'creatives' table.
-- ==============================================================================

-- 1. Ensure the 'creatives' table exists with all required columns
CREATE TABLE IF NOT EXISTS public.creatives (
    id TEXT PRIMARY KEY NOT NULL,
    creator_id TEXT,
    user_id TEXT,
    name TEXT,
    business_name TEXT,
    creative_name TEXT,
    handle TEXT,
    category TEXT DEFAULT 'visual',
    skills JSONB DEFAULT '[]'::jsonb,
    primary_gear TEXT,
    gear JSONB DEFAULT '[]'::jsonb,
    biography TEXT,
    bio TEXT,
    day_rate TEXT,
    base_rate_value NUMERIC DEFAULT 0,
    rate_range TEXT,
    pricing_notes TEXT,
    booking_email TEXT,
    base_location TEXT,
    location TEXT,
    portfolio_link TEXT,
    website TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    cover_url TEXT,
    image TEXT,
    image_url TEXT,
    instagram TEXT,
    payout_method TEXT,
    stripe_account_id TEXT,
    paypal_email TEXT,
    availability_status TEXT DEFAULT 'Available',
    quick_broadcast TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Ensure RLS policy allows access if RLS is enabled
ALTER TABLE public.creatives ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'creatives' AND policyname = 'Allow public access to creatives'
    ) THEN
        CREATE POLICY "Allow public access to creatives" ON public.creatives
            FOR ALL TO public USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 2. Upsert existing creative data from profiles into the creatives table
INSERT INTO public.creatives (
    id,
    creator_id,
    user_id,
    name,
    business_name,
    creative_name,
    handle,
    category,
    skills,
    primary_gear,
    gear,
    biography,
    bio,
    day_rate,
    base_rate_value,
    rate_range,
    pricing_notes,
    booking_email,
    base_location,
    location,
    portfolio_link,
    website,
    avatar_url,
    banner_url,
    cover_url,
    image,
    image_url,
    instagram,
    payout_method,
    stripe_account_id,
    paypal_email,
    availability_status,
    quick_broadcast,
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
        NULLIF(p.creative_name, ''),
        NULLIF(p.name, ''),
        'Nexus Creative'
    ) AS name,
    COALESCE(
        NULLIF(p.creative_metadata->>'business_name', ''),
        NULLIF(p.creative_name, ''),
        NULLIF(p.name, '')
    ) AS business_name,
    COALESCE(
        NULLIF(p.creative_name, ''),
        NULLIF(p.creative_metadata->>'business_name', ''),
        NULLIF(p.name, '')
    ) AS creative_name,
    COALESCE(
        p.creative_metadata->>'handle',
        p.console_handle
    ) AS handle,
    COALESCE(
        p.creative_metadata->>'primary_category',
        p.creative_metadata->>'category',
        'visual'
    ) AS category,
    CASE 
        WHEN p.creative_metadata->'selected_skills' IS NOT NULL AND jsonb_typeof(p.creative_metadata->'selected_skills') = 'array'
            THEN p.creative_metadata->'selected_skills'
        WHEN p.creative_metadata->'skills' IS NOT NULL AND jsonb_typeof(p.creative_metadata->'skills') = 'array'
            THEN p.creative_metadata->'skills'
        ELSE '[]'::jsonb
    END AS skills,
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
    CASE 
        WHEN p.creative_metadata->>'day_rate' IS NOT NULL THEN '$' || (p.creative_metadata->>'day_rate') || ' / Day'
        ELSE '$350 / Day'
    END AS rate_range,
    p.creative_metadata->>'pricing_notes' AS pricing_notes,
    COALESCE(
        p.creative_metadata->>'booking_email',
        p.email
    ) AS booking_email,
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
    p.creative_metadata->>'instagram' AS instagram,
    p.creative_metadata->>'payout_method' AS payout_method,
    p.creative_metadata->>'stripe_account_id' AS stripe_account_id,
    p.creative_metadata->>'paypal_email' AS paypal_email,
    COALESCE(p.creative_metadata->>'availability_status', 'Available') AS availability_status,
    p.creative_metadata->>'quick_broadcast' AS quick_broadcast,
    timezone('utc'::text, now()) AS created_at,
    timezone('utc'::text, now()) AS updated_at
FROM public.profiles p
WHERE (
    p.creative_metadata IS NOT NULL 
    OR p.creative_id IS NOT NULL 
    OR p.creative_name IS NOT NULL
    OR p.account_type = 'creative'
    OR p.registered_workspaces::text LIKE '%creative%'
)
ON CONFLICT (id) DO UPDATE SET
    creator_id = EXCLUDED.creator_id,
    user_id = EXCLUDED.user_id,
    name = COALESCE(EXCLUDED.name, creatives.name),
    business_name = COALESCE(EXCLUDED.business_name, creatives.business_name),
    creative_name = COALESCE(EXCLUDED.creative_name, creatives.creative_name),
    handle = COALESCE(EXCLUDED.handle, creatives.handle),
    category = COALESCE(EXCLUDED.category, creatives.category),
    skills = CASE WHEN jsonb_array_length(EXCLUDED.skills) > 0 THEN EXCLUDED.skills ELSE creatives.skills END,
    primary_gear = COALESCE(EXCLUDED.primary_gear, creatives.primary_gear),
    gear = CASE WHEN jsonb_array_length(EXCLUDED.gear) > 0 THEN EXCLUDED.gear ELSE creatives.gear END,
    biography = COALESCE(EXCLUDED.biography, creatives.biography),
    bio = COALESCE(EXCLUDED.bio, creatives.bio),
    day_rate = COALESCE(EXCLUDED.day_rate, creatives.day_rate),
    base_rate_value = COALESCE(EXCLUDED.base_rate_value, creatives.base_rate_value),
    rate_range = COALESCE(EXCLUDED.rate_range, creatives.rate_range),
    pricing_notes = COALESCE(EXCLUDED.pricing_notes, creatives.pricing_notes),
    booking_email = COALESCE(EXCLUDED.booking_email, creatives.booking_email),
    base_location = COALESCE(EXCLUDED.base_location, creatives.base_location),
    location = COALESCE(EXCLUDED.location, creatives.location),
    portfolio_link = COALESCE(EXCLUDED.portfolio_link, creatives.portfolio_link),
    website = COALESCE(EXCLUDED.website, creatives.website),
    avatar_url = COALESCE(EXCLUDED.avatar_url, creatives.avatar_url),
    banner_url = COALESCE(EXCLUDED.banner_url, creatives.banner_url),
    payout_method = COALESCE(EXCLUDED.payout_method, creatives.payout_method),
    stripe_account_id = COALESCE(EXCLUDED.stripe_account_id, creatives.stripe_account_id),
    paypal_email = COALESCE(EXCLUDED.paypal_email, creatives.paypal_email),
    availability_status = COALESCE(EXCLUDED.availability_status, creatives.availability_status),
    quick_broadcast = COALESCE(EXCLUDED.quick_broadcast, creatives.quick_broadcast),
    updated_at = timezone('utc'::text, now());

-- 3. Backfill creative_id on profiles table for users that have a creative record
UPDATE public.profiles p
SET 
    creative_id = c.id,
    creative_name = COALESCE(c.business_name, c.creative_name, c.name)
FROM public.creatives c
WHERE c.creator_id = p.id OR c.user_id = p.id;

-- 4. Clean up the deprecated creative_metadata column on profiles (Optional)
-- UPDATE public.profiles SET creative_metadata = NULL WHERE creative_metadata IS NOT NULL;
