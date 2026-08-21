-- =========================================================================
-- Supabase Schema Cleanup Script for public.bands (Fail-Safe Dynamic Version)
-- =========================================================================
-- Handles missing/already-dropped columns gracefully without failing SQL parsing.
-- =========================================================================

DO $$
DECLARE
  has_sub_genres BOOLEAN;
  has_genre_tags BOOLEAN;
  has_genres BOOLEAN;
  has_genre BOOLEAN;
  has_homebase BOOLEAN;
  has_location BOOLEAN;
  has_state BOOLEAN;
  has_youtube_url BOOLEAN;
  has_metal_archives BOOLEAN;
  has_user_id BOOLEAN;
  has_owner_id BOOLEAN;
  has_name BOOLEAN;
BEGIN
  -- Step 1: Ensure canonical columns exist on public.bands
  ALTER TABLE public.bands ADD COLUMN IF NOT EXISTS micro_genres TEXT[] DEFAULT '{}';
  ALTER TABLE public.bands ADD COLUMN IF NOT EXISTS city TEXT;
  ALTER TABLE public.bands ADD COLUMN IF NOT EXISTS state_province TEXT;
  ALTER TABLE public.bands ADD COLUMN IF NOT EXISTS country TEXT;
  ALTER TABLE public.bands ADD COLUMN IF NOT EXISTS featured_youtube_url TEXT;
  ALTER TABLE public.bands ADD COLUMN IF NOT EXISTS streaming_url TEXT;
  ALTER TABLE public.bands ADD COLUMN IF NOT EXISTS metal_archives_url TEXT;
  ALTER TABLE public.bands ADD COLUMN IF NOT EXISTS creator_id TEXT;
  ALTER TABLE public.bands ADD COLUMN IF NOT EXISTS band_name TEXT;

  -- Step 2: Detect existing columns in public.bands
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bands' AND column_name='sub_genres') INTO has_sub_genres;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bands' AND column_name='genre_tags') INTO has_genre_tags;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bands' AND column_name='genres') INTO has_genres;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bands' AND column_name='genre') INTO has_genre;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bands' AND column_name='homebase') INTO has_homebase;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bands' AND column_name='location') INTO has_location;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bands' AND column_name='state') INTO has_state;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bands' AND column_name='youtube_url') INTO has_youtube_url;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bands' AND column_name='metal_archives') INTO has_metal_archives;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bands' AND column_name='user_id') INTO has_user_id;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bands' AND column_name='owner_id') INTO has_owner_id;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bands' AND column_name='name') INTO has_name;

  -- Step 3: Conditionally migrate data from old columns before dropping
  IF has_sub_genres THEN
    EXECUTE 'UPDATE public.bands SET micro_genres = ARRAY_CAT(COALESCE(micro_genres, ''{}''), COALESCE(sub_genres, ''{}'')) WHERE sub_genres IS NOT NULL;';
  END IF;

  IF has_genre_tags THEN
    EXECUTE 'UPDATE public.bands SET micro_genres = ARRAY_CAT(COALESCE(micro_genres, ''{}''), COALESCE(genre_tags, ''{}'')) WHERE genre_tags IS NOT NULL;';
  END IF;

  IF has_genres THEN
    EXECUTE 'UPDATE public.bands SET micro_genres = ARRAY_CAT(COALESCE(micro_genres, ''{}''), COALESCE(genres, ''{}'')) WHERE genres IS NOT NULL;';
  END IF;

  IF has_genre THEN
    EXECUTE 'UPDATE public.bands SET micro_genres = ARRAY_APPEND(COALESCE(micro_genres, ''{}''), genre) WHERE genre IS NOT NULL AND genre <> '''';';
  END IF;

  -- Filter out primary genres from micro_genres array
  UPDATE public.bands
  SET micro_genres = (
    SELECT ARRAY(
      SELECT DISTINCT TRIM(g)
      FROM unnest(COALESCE(micro_genres, '{}'::text[])) AS g
      WHERE g IS NOT NULL AND TRIM(g) <> ''
        AND LOWER(TRIM(g)) NOT IN (
          'extreme metal', 'rock / heavy metal', 'rock', 'metal', 'heavy metal', 
          'hardcore / punk', 'hardcore', 'punk', 'electronic / industrial', 
          'hip-hop / underground', 'hip-hop', 'electronic', 'general', 'other'
        )
    )
  );

  -- Conditionally migrate location data
  IF has_homebase THEN
    EXECUTE 'UPDATE public.bands SET city = COALESCE(city, TRIM(SPLIT_PART(homebase, '','', 1))) WHERE homebase IS NOT NULL AND homebase <> '''';';
    EXECUTE 'UPDATE public.bands SET state_province = COALESCE(state_province, TRIM(SPLIT_PART(homebase, '','', 2))) WHERE homebase IS NOT NULL AND ARRAY_LENGTH(STRING_TO_ARRAY(homebase, '',''), 1) >= 2;';
    EXECUTE 'UPDATE public.bands SET country = COALESCE(country, TRIM(SPLIT_PART(homebase, '','', 3))) WHERE homebase IS NOT NULL AND ARRAY_LENGTH(STRING_TO_ARRAY(homebase, '',''), 1) >= 3;';
  END IF;

  IF has_location THEN
    EXECUTE 'UPDATE public.bands SET city = COALESCE(city, TRIM(SPLIT_PART(location, '','', 1))) WHERE location IS NOT NULL AND location <> '''';';
    EXECUTE 'UPDATE public.bands SET state_province = COALESCE(state_province, TRIM(SPLIT_PART(location, '','', 2))) WHERE location IS NOT NULL AND ARRAY_LENGTH(STRING_TO_ARRAY(location, '',''), 1) >= 2;';
  END IF;

  IF has_state THEN
    EXECUTE 'UPDATE public.bands SET state_province = COALESCE(state_province, state) WHERE state IS NOT NULL AND state <> '''';';
  END IF;

  -- Conditionally migrate media & links
  IF has_youtube_url THEN
    EXECUTE 'UPDATE public.bands SET featured_youtube_url = COALESCE(featured_youtube_url, youtube_url) WHERE youtube_url IS NOT NULL;';
  END IF;

  IF has_metal_archives THEN
    EXECUTE 'UPDATE public.bands SET metal_archives_url = COALESCE(metal_archives_url, metal_archives) WHERE metal_archives IS NOT NULL;';
  END IF;

  -- Conditionally migrate ownership IDs
  IF has_user_id THEN
    EXECUTE 'UPDATE public.bands SET creator_id = COALESCE(creator_id, user_id) WHERE user_id IS NOT NULL;';
  END IF;

  IF has_owner_id THEN
    EXECUTE 'UPDATE public.bands SET creator_id = COALESCE(creator_id, owner_id) WHERE owner_id IS NOT NULL;';
  END IF;

  -- Conditionally migrate band name
  IF has_name THEN
    EXECUTE 'UPDATE public.bands SET band_name = COALESCE(band_name, name) WHERE name IS NOT NULL;';
  END IF;

  -- Step 4: Drop redundant columns safely
  ALTER TABLE public.bands DROP COLUMN IF EXISTS genre;
  ALTER TABLE public.bands DROP COLUMN IF EXISTS genres;
  ALTER TABLE public.bands DROP COLUMN IF EXISTS genre_tags;
  ALTER TABLE public.bands DROP COLUMN IF EXISTS sub_genres;

  ALTER TABLE public.bands DROP COLUMN IF EXISTS homebase;
  ALTER TABLE public.bands DROP COLUMN IF EXISTS location;
  ALTER TABLE public.bands DROP COLUMN IF EXISTS state;

  ALTER TABLE public.bands DROP COLUMN IF EXISTS youtube_url;
  ALTER TABLE public.bands DROP COLUMN IF EXISTS metal_archives;

  ALTER TABLE public.bands DROP COLUMN IF EXISTS user_id;
  ALTER TABLE public.bands DROP COLUMN IF EXISTS owner_id;

  ALTER TABLE public.bands DROP COLUMN IF EXISTS name;

END $$;
