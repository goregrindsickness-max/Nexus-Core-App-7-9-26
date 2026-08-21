import { getSupabase } from './clientService';

export const PRIMARY_GENRE_KEYWORDS = new Set([
  'extreme metal',
  'rock / heavy metal',
  'rock',
  'heavy metal',
  'hardcore / punk',
  'hardcore',
  'punk',
  'electronic / industrial',
  'hip-hop / underground',
  'hip-hop',
  'electronic',
  'general',
  'other',
]);

export function sanitizeMicroGenres(genresInput: any): string[] {
  if (!genresInput) return [];
  let list: string[] = [];
  if (Array.isArray(genresInput)) {
    list = genresInput;
  } else if (typeof genresInput === 'string') {
    try {
      const parsed = JSON.parse(genresInput);
      if (Array.isArray(parsed)) list = parsed;
      else list = genresInput.split(',').map((s) => s.trim());
    } catch {
      list = genresInput.split(',').map((s) => s.trim());
    }
  }
  const filtered = list
    .filter(Boolean)
    .map((g) => String(g).trim())
    .filter((g) => g.length > 0 && !PRIMARY_GENRE_KEYWORDS.has(g.toLowerCase()));
  return Array.from(new Set(filtered));
}

export function parseLocationFields(locInput: any): { city: string; state_province: string; country: string } {
  if (!locInput) return { city: '', state_province: '', country: '' };

  if (typeof locInput === 'object') {
    return {
      city: locInput.city || locInput.homebase_city || '',
      state_province: locInput.state_province || locInput.state || '',
      country: locInput.country || '',
    };
  }

  if (typeof locInput === 'string') {
    const parts = locInput
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 1) {
      return { city: parts[0], state_province: '', country: '' };
    } else if (parts.length === 2) {
      return { city: parts[0], state_province: parts[1], country: '' };
    } else if (parts.length >= 3) {
      return { city: parts[0], state_province: parts[1], country: parts.slice(2).join(', ') };
    }
  }

  return { city: '', state_province: '', country: '' };
}

export function formatBandLocation(band: any): string {
  if (!band) return 'Global Scene';
  const city = band.city || '';
  const state_province = band.state_province || band.state || '';
  const country = band.country || '';
  const compiled = [city, state_province, country].filter(Boolean).join(', ');
  if (compiled) return compiled;
  if (band.homebase) return band.homebase;
  if (band.location) return band.location;
  return 'Global Scene';
}

export const VALID_BAND_COLUMNS = new Set([
  'id',
  'band_name',
  'logo_url',
  'cover_url',
  'micro_genres',
  'city',
  'state_province',
  'country',
  'founded_year',
  'bio',
  'music_link',
  'label_id',
  'custom_slug',
  'booking_email',
  'booking_phone',
  'featured_youtube_url',
  'streaming_url',
  'tour_vehicle',
  'tech_rider_url',
  'lineup',
  'payment_routing',
  'creator_id',
  'is_verified',
  'verification_platform',
  'metal_archives_url',
  'headcount',
  'apparel_sizes',
  'user_role_in_band',
  'record_label',
  'legal_name',
  'tax_id',
  'legal_entity_type',
  'instagram',
  'spotify',
  'apple_music',
  'bandcamp',
  'website',
  'created_at',
  'updated_at',
]);

export function sanitizeBandPayload(rawPayload: any): Record<string, any> {
  if (!rawPayload || typeof rawPayload !== 'object') return {};

  const clean: Record<string, any> = { ...rawPayload };

  // 1. Single micro_genres column
  const rawGenreSources = [
    clean.micro_genres,
    clean.sub_genres,
    clean.genre_tags,
    clean.genres,
    clean.genre,
  ];
  let combinedGenres: string[] = [];
  for (const src of rawGenreSources) {
    if (src) {
      const sanitized = sanitizeMicroGenres(src);
      if (sanitized.length > 0) {
        combinedGenres = Array.from(new Set([...combinedGenres, ...sanitized]));
      }
    }
  }
  clean.micro_genres = combinedGenres;

  delete clean.genre;
  delete clean.genres;
  delete clean.genre_tags;
  delete clean.sub_genres;

  // 2. Location columns (city, state_province, country)
  let city = clean.city || '';
  let state_province = clean.state_province || clean.state || '';
  let country = clean.country || '';

  if (!city && !state_province && !country) {
    const parsed = parseLocationFields(clean.homebase || clean.location);
    city = parsed.city;
    state_province = parsed.state_province;
    country = parsed.country;
  }

  clean.city = city || null;
  clean.state_province = state_province || null;
  clean.country = country || null;

  delete clean.homebase;
  delete clean.location;
  delete clean.state;

  // 3. YouTube and Streaming URLs (keep featured_youtube_url and streaming_url)
  const featYt = clean.featured_youtube_url || clean.youtube_url || '';
  clean.featured_youtube_url = featYt || null;
  delete clean.youtube_url;

  // 4. Metal Archives URL (keep metal_archives_url)
  const maUrl = clean.metal_archives_url || clean.metal_archives || '';
  clean.metal_archives_url = maUrl || null;
  delete clean.metal_archives;

  // 5. Single Creator ID (creator_id)
  const creatorId = clean.creator_id || clean.user_id || clean.owner_id || null;
  clean.creator_id = creatorId;
  delete clean.user_id;
  delete clean.owner_id;
  delete clean.profile_id;

  // 6. Single Band Name (band_name)
  const bName = clean.band_name || clean.name || '';
  clean.band_name = bName || null;
  delete clean.name;

  // 7. Strictly sanitize logo_url and cover_url to save proper public URL strings and resilient image data
  const rawLogo =
    clean.logo_url ??
    clean.logo ??
    clean.band_logo ??
    (clean.avatar_url && !clean.avatar_url.includes('Nexus%20Icon%20Circuits.png') ? clean.avatar_url : null);
  if (typeof rawLogo === 'string' && rawLogo.trim().length > 0) {
    clean.logo_url = rawLogo.trim();
  } else {
    clean.logo_url = null;
  }
  delete clean.logo;
  delete clean.band_logo;

  const rawCover =
    clean.cover_url ?? clean.cover ?? clean.band_cover ?? clean.banner_url ?? clean.banner ?? null;
  if (typeof rawCover === 'string' && rawCover.trim().length > 0) {
    clean.cover_url = rawCover.trim();
  } else {
    clean.cover_url = null;
  }
  delete clean.cover;
  delete clean.band_cover;
  delete clean.banner;

  // 8. STRICT SEPARATION: Completely strip out any user profile image and account properties
  delete clean.avatar_url;
  delete clean.avatarUrl;
  delete clean.avatar;
  delete clean.creative_avatar;
  delete clean.promoter_logo;
  delete clean.label_avatar;
  delete clean.profileAvatarUrl;
  delete clean.banner_url;
  delete clean.bannerUrl;
  delete clean.creative_banner;
  delete clean.promoter_cover_image;
  delete clean.label_banner;
  delete clean.coverImage;
  delete clean.profileCoverUrl;

  // 9. Completely strip out user profile account fields to avoid schema cache 400 Bad Request errors
  delete clean.email;
  delete clean.password;
  delete clean.pin;
  delete clean.role;
  delete clean.account_type;
  delete clean.full_name;
  delete clean.console_handle;
  delete clean.phone;
  delete clean.active_workspace;
  delete clean.allowed_workspaces;
  delete clean.registered_workspaces;
  delete clean.photo_folders;
  delete clean.update_ticker;
  delete clean.rosterTicker;
  delete clean.profileBlurb;
  delete clean.shipping_address;
  delete clean.shipping_city;
  delete clean.shipping_state;
  delete clean.shipping_postal_code;
  delete clean.shipping_country;
  delete clean.label_shipping_address;
  delete clean.label_shipping_city;
  delete clean.label_shipping_state;
  delete clean.label_shipping_postal_code;
  delete clean.label_shipping_country;
  delete clean.label_security_pin;
  delete clean.label_custom_domain;
  delete clean.label_payout_email;
  delete clean.promoter_metadata;
  delete clean.creative_metadata;
  delete clean.label_metadata;
  delete clean.band_metadata;
  delete clean.user_metadata;
  delete clean.subscription_tier;
  delete clean.subscription_status;
  delete clean.is_subscribed;
  delete clean.auth_id;
  delete clean.targetBandId;
  delete clean.target_band_id;

  // 10. UUID sanitization for foreign keys like label_id
  if (clean.label_id) {
    const labelIdStr = String(clean.label_id).trim();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(labelIdStr)) {
      delete clean.label_id;
    }
  }

  // 11. Enforce strict whitelist of valid 'bands' table columns
  for (const key of Object.keys(clean)) {
    if (!VALID_BAND_COLUMNS.has(key)) {
      delete clean[key];
    }
  }

  return clean;
}

export const mapBandData = (rows: any[] | null) => {
  if (!rows) return [];
  return rows.map((b) => {
    const city = b.city || '';
    const state_province = b.state_province || b.state || '';
    const country = b.country || '';
    const compiledLocation =
      [city, state_province, country].filter(Boolean).join(', ') || b.homebase || b.location || 'Global Scene';

    const cleanMicroGenres = sanitizeMicroGenres(
      b.micro_genres || b.sub_genres || b.genre_tags || b.genres || b.genre
    );
    const validBandName = b.band_name || b.name || 'Unnamed Band';
    const validCreatorId = b.creator_id || b.user_id || b.owner_id || null;
    const validFeaturedYoutube = b.featured_youtube_url || b.youtube_url || '';
    const validMetalArchives = b.metal_archives_url || b.metal_archives || '';

    return {
      ...b,
      // Canonical name field and legacy in-memory alias
      band_name: validBandName,
      name: validBandName,
      // Canonical owner ID and legacy in-memory aliases
      creator_id: validCreatorId,
      user_id: validCreatorId,
      owner_id: validCreatorId,
      // Canonical media URLs and legacy aliases
      featured_youtube_url: validFeaturedYoutube,
      youtube_url: validFeaturedYoutube,
      metal_archives_url: validMetalArchives,
      metal_archives: validMetalArchives,
      // Location
      city,
      state_province,
      country,
      homebase: compiledLocation,
      location: compiledLocation,
      // Genres
      micro_genres: cleanMicroGenres,
      genre: cleanMicroGenres.length > 0 ? cleanMicroGenres.join(' • ') : 'Metal / Hardcore',
      genres: cleanMicroGenres,
      genre_tags: cleanMicroGenres,
    };
  });
};

export const fetchUserBands = async (userId: string) => {
  if (!userId) return [];
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('bands')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Notice fetching bands:', error.message);
      return [];
    }

    return mapBandData(data);
  } catch (err: any) {
    console.warn('Notice fetching bands exception:', err?.message || err);
    return [];
  }
};
