// Nexus Band Community & Verification Management
// Manages community archives, name collision checks, verification status, and artist handover forks

import {
  getSupabase,
  uploadBase64ToStorage,
  executeWithSchemaResilience,
  sanitizeBandPayload,
  ensureUUID
} from '../supabase';

export type BandVerificationStatus = 'community_archive' | 'claim_pending' | 'verified_official';

export interface LineupMember {
  id?: string;
  name: string;
  role: string;
  status?: 'active' | 'past' | 'touring';
  years?: string;
  avatar_url?: string;
}

export interface DiscographyTrack {
  number?: number;
  title: string;
  duration?: string;
  stream_url?: string;
}

export interface DiscographyRelease {
  id?: string;
  title: string;
  year: string;
  type: 'album' | 'ep' | 'single' | 'demo';
  image_url?: string;
  release_info?: string;
  catalog_id?: string;
  label?: string;
  tracks?: DiscographyTrack[];
}

export interface CommunityBandRecord {
  id: string;
  name: string;
  genre: string;
  subgenres?: string[];
  founded_year?: string;
  city?: string;
  country?: string;
  state?: string;
  state_province?: string;
  record_label?: string;
  label?: string;
  bio?: string;
  avatar_url?: string;
  cover_url?: string;
  spotify_url?: string;
  bandcamp_url?: string;
  metal_archives_url?: string;
  youtube_url?: string;
  featured_youtube_url?: string;
  lineup?: LineupMember[];
  discography?: DiscographyRelease[];
  creator_id?: string;
  curated_by?: string; // Fan curator handle or user ID
  curator_name?: string;
  created_at: string;
  verification_status: BandVerificationStatus;
  claimed_by_user_id?: string;
  claimed_at?: string;
  followers_count?: number;
}

// Initial pre-seeded community archives for iconic & mock underground bands
export const INITIAL_COMMUNITY_BANDS: CommunityBandRecord[] = [
  {
    id: 'comm-band-necrophagist',
    name: 'Necrophagist',
    genre: 'Technical Death Metal',
    subgenres: ['Neoclassical Death Metal', 'Progressive Metal'],
    founded_year: '1992',
    city: 'Gaggenau',
    state: 'Baden-Württemberg',
    state_province: 'Baden-Württemberg',
    country: 'DE',
    record_label: 'Willowtip / Relapse Records',
    label: 'Willowtip / Relapse Records',
    bio: 'Pioneering technical death metal band founded by Muhammed Suiçmez in 1992. Known for neoclassical guitar arpeggios, extreme technical precision, and defining albums "Epitaph" and "Onset of Putrefaction".',
    avatar_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400',
    cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200',
    spotify_url: 'https://open.spotify.com/artist/4ZgH0b67h8U7s8b1vB1e1e',
    metal_archives_url: 'https://www.metal-archives.com/bands/Necrophagist/238',
    youtube_url: 'https://www.youtube.com/watch?v=0hY48qHjM7I',
    featured_youtube_url: 'https://www.youtube.com/watch?v=0hY48qHjM7I',
    verification_status: 'community_archive',
    curated_by: '@goregrinder',
    curator_name: 'Goregrind Archivist',
    created_at: '2026-01-10T12:00:00Z',
    followers_count: 2410,
    lineup: [
      { id: 'mem-1', name: 'Muhammed Suiçmez', role: 'Lead Guitars, Vocals', status: 'active', years: '1992–present' },
      { id: 'mem-2', name: 'Sami Raatikainen', role: 'Rhythm Guitars', status: 'active', years: '2006–present' },
      { id: 'mem-3', name: 'Stephan Fimmers', role: 'Bass', status: 'active', years: '2003–present' },
      { id: 'mem-4', name: 'Romain Goulon', role: 'Drums', status: 'active', years: '2008–present' },
      { id: 'mem-5', name: 'Christian Münzner', role: 'Lead Guitars', status: 'past', years: '2002–2006' },
      { id: 'mem-6', name: 'Hannes Grossmann', role: 'Drums', status: 'past', years: '2003–2007' }
    ],
    discography: [
      {
        id: 'rel-necro-1',
        title: 'Onset of Putrefaction',
        year: '1999',
        type: 'album',
        release_info: 'Recorded and programmed entirely by Muhammed Suiçmez. Willowtip Records / Relapse.',
        catalog_id: 'WT-014',
        label: 'Willowtip Records',
        tracks: [
          { number: 1, title: 'Foul Body Autopsy', duration: '1:53' },
          { number: 2, title: 'To Breathe in a Casket', duration: '5:41' },
          { number: 3, title: 'Fermented Offal Discharge', duration: '4:43' },
          { number: 4, title: 'Mutilate the Stillborn', duration: '3:43' },
          { number: 5, title: 'Intestinal Incubation', duration: '4:12' }
        ]
      },
      {
        id: 'rel-necro-2',
        title: 'Epitaph',
        year: '2004',
        type: 'album',
        release_info: 'Relapse Records / Cat #RR6623. Seminal technical death metal masterwork.',
        catalog_id: 'RR-6623',
        label: 'Relapse Records',
        tracks: [
          { number: 1, title: 'Stabwound', duration: '2:48' },
          { number: 2, title: 'The Stillborn One', duration: '4:24' },
          { number: 3, title: 'Ignominious & Pale', duration: '4:01' },
          { number: 4, title: 'Diminished to B', duration: '4:59' },
          { number: 5, title: 'Epitaph', duration: '4:15' },
          { number: 6, title: 'Only Ash Remains', duration: '4:11' },
          { number: 7, title: 'Seven', duration: '3:44' },
          { number: 8, title: 'Symbiotic in Theory', duration: '4:35' }
        ]
      }
    ]
  },
  {
    id: 'comm-band-sanguisugabogg',
    name: 'Sanguisugabogg',
    genre: 'Death Metal',
    subgenres: ['Caveman Death Metal', 'Slam', 'Hardcore'],
    founded_year: '2019',
    city: 'Columbus',
    state: 'OH',
    state_province: 'OH',
    country: 'USA',
    record_label: 'Century Media Records',
    label: 'Century Media Records',
    bio: 'Heavy death metal unit from Columbus, Ohio, playing downtuned grotesque riffs, blunt caveman rhythms, and ferocious pit anthems on Century Media Records.',
    avatar_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=400',
    cover_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200',
    spotify_url: 'https://open.spotify.com/artist/0k1mXq1Y2N7W4K8o5d0L3q',
    metal_archives_url: 'https://www.metal-archives.com/bands/Sanguisugabogg/3540455071',
    youtube_url: 'https://www.youtube.com/watch?v=1F2b_dEvFqg',
    featured_youtube_url: 'https://www.youtube.com/watch?v=1F2b_dEvFqg',
    verification_status: 'community_archive',
    curated_by: '@midwest_slammer',
    curator_name: 'Midwest Pit Crew',
    created_at: '2026-02-14T08:30:00Z',
    followers_count: 1840,
    lineup: [
      { id: 'bogg-1', name: 'Devin Swank', role: 'Lead Vocals', status: 'active', years: '2019–present' },
      { id: 'bogg-2', name: 'Cody Davidson', role: 'Drums', status: 'active', years: '2019–present' },
      { id: 'bogg-3', name: 'Ced Davis', role: 'Guitars', status: 'active', years: '2019–present' },
      { id: 'bogg-4', name: 'Drew Arnold', role: 'Bass / Guitars', status: 'active', years: '2021–present' }
    ],
    discography: [
      {
        id: 'rel-bogg-1',
        title: 'Pornographic Seizures',
        year: '2019',
        type: 'ep',
        release_info: 'Maggot Stomp Records debut EP.',
        catalog_id: 'MS-023',
        label: 'Maggot Stomp',
        tracks: [
          { number: 1, title: 'Uningesting Cavity Weight', duration: '2:15' },
          { number: 2, title: 'Turkish Tub', duration: '2:40' },
          { number: 3, title: 'Perverse', duration: '2:30' }
        ]
      },
      {
        id: 'rel-bogg-2',
        title: 'Tortured Whole',
        year: '2021',
        type: 'album',
        release_info: 'Century Media Records full-length debut.',
        catalog_id: 'CM-19439',
        label: 'Century Media',
        tracks: [
          { number: 1, title: 'Menstrual Envy', duration: '3:45' },
          { number: 2, title: 'Gurgling Toothache', duration: '3:19' },
          { number: 3, title: 'Dead as Shit', duration: '3:10' },
          { number: 4, title: 'Dick Filet', duration: '3:22' }
        ]
      },
      {
        id: 'rel-bogg-3',
        title: 'Homicidal Ecstasy',
        year: '2023',
        type: 'album',
        release_info: 'Mixed by Kurt Ballou at GodCity Studio.',
        catalog_id: 'CM-19642',
        label: 'Century Media',
        tracks: [
          { number: 1, title: 'Black Market Vasectomy', duration: '2:56' },
          { number: 2, title: 'Face Ripped Off', duration: '3:43' },
          { number: 3, title: 'Necrosexual Deviant', duration: '2:15' },
          { number: 4, title: 'Mortal Admonition', duration: '4:15' }
        ]
      }
    ]
  },
  {
    id: 'comm-band-mortician',
    name: 'Mortician',
    genre: 'Death Metal / Grindcore',
    subgenres: ['Brutal Death Metal', 'Horror Death Grind'],
    founded_year: '1989',
    city: 'Yonkers',
    state: 'NY',
    state_province: 'NY',
    country: 'USA',
    record_label: 'Relapse Records',
    label: 'Relapse Records',
    bio: 'Iconic horror-sample laden brutal death metal duo formed in 1989 by Will Rahmer. Famous for ultra-low bass tuning, blistering drum machine blasts, and classic horror movie introductions.',
    avatar_url: 'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?auto=format&fit=crop&q=80&w=400',
    cover_url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=1200',
    metal_archives_url: 'https://www.metal-archives.com/bands/Mortician/328',
    youtube_url: 'https://www.youtube.com/watch?v=kYyYV0K3x6Y',
    featured_youtube_url: 'https://www.youtube.com/watch?v=kYyYV0K3x6Y',
    verification_status: 'community_archive',
    curated_by: '@horror_grind_vault',
    curator_name: 'NY Death Metal Vault',
    created_at: '2026-03-01T15:00:00Z',
    followers_count: 3120,
    lineup: [
      { id: 'mort-1', name: 'Will Rahmer', role: 'Bass, Vocals', status: 'active', years: '1989–present' },
      { id: 'mort-2', name: 'Roger Beaujard', role: 'Guitars, Drum Programming', status: 'active', years: '1991–present' }
    ],
    discography: [
      {
        id: 'rel-mort-1',
        title: 'House by the Cemetery',
        year: '1995',
        type: 'ep',
        release_info: 'Relapse Records EP.',
        tracks: [
          { number: 1, title: 'Intro / House by the Cemetery', duration: '2:53' },
          { number: 2, title: 'Procreation of the Wicked', duration: '2:31' }
        ]
      },
      {
        id: 'rel-mort-2',
        title: 'Hacked up for Barbecue',
        year: '1996',
        type: 'album',
        release_info: 'Relapse Records classic debut.',
        tracks: [
          { number: 1, title: 'Bloodcraving', duration: '5:13' },
          { number: 2, title: 'Embalmed Alive', duration: '0:50' },
          { number: 3, title: 'Hacked Up for Barbecue', duration: '4:18' },
          { number: 4, title: 'Abolition', duration: '1:34' },
          { number: 5, title: 'Necrocannibal', duration: '3:59' }
        ]
      },
      {
        id: 'rel-mort-3',
        title: 'Chainsaw Dismemberment',
        year: '1999',
        type: 'album',
        release_info: 'Relapse Records / Cat #RR6428.',
        tracks: [
          { number: 1, title: 'Stab', duration: '3:53' },
          { number: 2, title: 'Fleshripper', duration: '0:54' },
          { number: 3, title: 'Chainsaw Dismemberment', duration: '4:04' }
        ]
      }
    ]
  },
  {
    id: 'comm-band-dying-fetus',
    name: 'Dying Fetus',
    genre: 'Technical Brutal Death Metal',
    subgenres: ['Grindcore', 'Groove Metal'],
    city: 'Upper Marlboro',
    state: 'MD',
    country: 'USA',
    bio: 'American technical death metal titan formed in 1991. Masterful combination of blasting grindcore, technical guitar sweeps, and signature heavy slam grooves.',
    avatar_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=400',
    cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200',
    metal_archives_url: 'https://www.metal-archives.com/bands/Dying_Fetus/154',
    youtube_url: 'https://www.youtube.com/watch?v=0hY48qHjM7I',
    featured_youtube_url: 'https://www.youtube.com/watch?v=0hY48qHjM7I',
    verification_status: 'community_archive',
    curated_by: '@maryland_pit_lord',
    curator_name: 'DMV Death Metal Society',
    created_at: '2026-03-12T10:00:00Z',
    followers_count: 4590,
    lineup: [
      { id: 'fetus-1', name: 'John Gallagher', role: 'Lead Guitars, Vocals', status: 'active', years: '1991–present' },
      { id: 'fetus-2', name: 'Sean Beasley', role: 'Bass, Vocals', status: 'active', years: '2001–present' },
      { id: 'fetus-3', name: 'Trey Williams', role: 'Drums', status: 'active', years: '2007–present' }
    ],
    discography: [
      {
        id: 'rel-fetus-1',
        title: 'Destroy the Opposition',
        year: '2000',
        type: 'album',
        release_info: 'Relapse Records breakthrough album.',
        tracks: [
          { number: 1, title: 'Praise the Lord (Opium of the Masses)', duration: '5:31' },
          { number: 2, title: 'Epidemic of Hate', duration: '4:42' },
          { number: 3, title: 'Justify Injustice', duration: '3:48' }
        ]
      },
      {
        id: 'rel-fetus-2',
        title: 'Reign Supreme',
        year: '2012',
        type: 'album',
        release_info: 'Relapse Records.',
        tracks: [
          { number: 1, title: 'In the Trenches', duration: '3:09' },
          { number: 2, title: 'From Womb to Waste', duration: '4:43' },
          { number: 3, title: 'Subjected to a Beating', duration: '4:53' }
        ]
      },
      {
        id: 'rel-fetus-3',
        title: 'Make Them Beg for Death',
        year: '2023',
        type: 'album',
        release_info: 'Relapse Records.',
        tracks: [
          { number: 1, title: 'Enlighten Through Agony', duration: '3:49' },
          { number: 2, title: 'Compulsion for Cruelty', duration: '4:36' },
          { number: 3, title: 'Feast of Ashes', duration: '4:35' },
          { number: 4, title: 'Throw Them in the Van', duration: '1:42' },
          { number: 5, title: 'Unbridled Fury', duration: '3:30' }
        ]
      }
    ]
  }
];

const STORAGE_KEY = 'nexus_community_band_archives';

export class CommunityBandManager {
  private static instance: CommunityBandManager;

  private constructor() {
    this.initStorage();
  }

  public static getInstance(): CommunityBandManager {
    if (!CommunityBandManager.instance) {
      CommunityBandManager.instance = new CommunityBandManager();
    }
    return CommunityBandManager.instance;
  }

  private initStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COMMUNITY_BANDS));
      }
    } catch (e) {
      console.warn('Error initializing community band archives:', e);
    }
  }

  public getAll(): CommunityBandRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : INITIAL_COMMUNITY_BANDS;
      const arr = Array.isArray(list) ? list : INITIAL_COMMUNITY_BANDS;
      const seen = new Set<string>();
      const seenNames = new Set<string>();
      const result: CommunityBandRecord[] = [];
      for (const item of arr) {
        if (!item || !item.id) continue;
        const normName = (item.name || '').toLowerCase().trim();
        if (!seen.has(item.id) && (!normName || !seenNames.has(normName))) {
          seen.add(item.id);
          if (normName) seenNames.add(normName);
          result.push(item);
        }
      }
      return result.length > 0 ? result : INITIAL_COMMUNITY_BANDS;
    } catch {
      return INITIAL_COMMUNITY_BANDS;
    }
  }

  public findByName(name: string): CommunityBandRecord | null {
    if (!name || !name.trim()) return null;
    const clean = name.trim().toLowerCase();
    const all = this.getAll();
    return all.find((b) => b.name.toLowerCase() === clean || b.name.toLowerCase().replace(/[^a-z0-9]/g, '') === clean.replace(/[^a-z0-9]/g, '')) || null;
  }

  public getById(id: string): CommunityBandRecord | null {
    if (!id) return null;
    const all = this.getAll();
    return all.find((b) => b.id === id) || null;
  }

  // Create or quick-edit a fan/community band page without official registration forms
  public upsertCommunityBand(band: Partial<CommunityBandRecord> & { name: string }): CommunityBandRecord {
    const all = this.getAll();
    const existingIndex = all.findIndex(
      (b) => b.name.toLowerCase().trim() === band.name.toLowerCase().trim() || (band.id && b.id === band.id)
    );

    const now = new Date().toISOString();

    let result: CommunityBandRecord;

    if (existingIndex >= 0) {
      const updated: CommunityBandRecord = {
        ...all[existingIndex],
        ...band,
        name: band.name.trim(),
        founded_year: band.founded_year || all[existingIndex].founded_year,
        city: band.city !== undefined ? band.city : all[existingIndex].city,
        state: band.state !== undefined ? band.state : all[existingIndex].state,
        state_province: band.state_province || band.state || all[existingIndex].state_province || all[existingIndex].state,
        country: band.country !== undefined ? band.country : all[existingIndex].country,
        record_label: band.record_label || band.label || all[existingIndex].record_label || all[existingIndex].label,
        label: band.label || band.record_label || all[existingIndex].label || all[existingIndex].record_label,
        creator_id: band.creator_id || all[existingIndex].creator_id,
        verification_status: band.verification_status || all[existingIndex].verification_status || 'community_archive'
      };
      all[existingIndex] = updated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('nexus_community_bands_updated', { detail: updated }));
      result = updated;
    } else {
      const newBand: CommunityBandRecord = {
        id: band.id || `comm-band-${Date.now()}`,
        name: band.name.trim(),
        genre: band.genre || 'Extreme Metal',
        subgenres: band.subgenres || [],
        founded_year: band.founded_year || '',
        city: band.city || '',
        state: band.state || '',
        state_province: band.state_province || band.state || '',
        country: band.country || 'USA',
        record_label: band.record_label || band.label || '',
        label: band.label || band.record_label || '',
        bio: band.bio || `Community-curated archive and discography for ${band.name.trim()}.`,
        avatar_url: band.avatar_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400',
        cover_url: band.cover_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200',
        spotify_url: band.spotify_url || '',
        bandcamp_url: band.bandcamp_url || '',
        metal_archives_url: band.metal_archives_url || '',
        youtube_url: band.youtube_url || band.featured_youtube_url || '',
        featured_youtube_url: band.featured_youtube_url || band.youtube_url || '',
        lineup: band.lineup || [],
        discography: band.discography || [],
        creator_id: band.creator_id,
        curated_by: band.curated_by || '@fan_archivist',
        curator_name: band.curator_name || 'Community Archivist',
        created_at: now,
        verification_status: 'community_archive',
        followers_count: band.followers_count || 120
      };
      all.unshift(newBand);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('nexus_community_bands_updated', { detail: newBand }));
      result = newBand;
    }

    // Proactively sync band row to Supabase 'bands' table & 'releases' table
    this.syncToSupabaseTables(result).catch((e) => {
      console.warn('[communityBands] Supabase remote sync notice:', e);
    });

    return result;
  }

  // Background & explicit sync to live Supabase 'bands' & 'releases' tables and buckets
  public async syncToSupabaseTables(band: CommunityBandRecord): Promise<{ success: boolean; error?: string }> {
    try {
      const client = getSupabase();
      if (!client) {
        return { success: true };
      }

      // Ensure stable deterministic UUID for bands table
      const bandUUID = ensureUUID(band.id);

      // Auto-upload base64 images to appropriate buckets if not already public URLs
      let finalAvatarUrl = band.avatar_url;
      if (finalAvatarUrl && finalAvatarUrl.startsWith('data:image')) {
        try {
          const uploaded = await uploadBase64ToStorage(finalAvatarUrl, 'avatars', bandUUID, 'avatar');
          if (uploaded) finalAvatarUrl = uploaded;
        } catch (err) {
          console.warn('[communityBands] Avatar storage upload fallback:', err);
        }
      }

      let finalCoverUrl = band.cover_url;
      if (finalCoverUrl && finalCoverUrl.startsWith('data:image')) {
        try {
          const uploaded = await uploadBase64ToStorage(finalCoverUrl, 'bannersv2', bandUUID, 'banner');
          if (uploaded) finalCoverUrl = uploaded;
        } catch (err) {
          console.warn('[communityBands] Cover banner storage upload fallback:', err);
        }
      }

      // 1. Sync to 'bands' table using schema resilience & sanitization
      const rawBandPayload: Record<string, any> = {
        id: bandUUID,
        name: band.name,
        band_name: band.name,
        genre: band.genre,
        subgenres: band.subgenres || [],
        micro_genres: band.subgenres || [],
        founded_year: band.founded_year || null,
        city: band.city || null,
        state: band.state || band.state_province || null,
        state_province: band.state_province || band.state || null,
        country: band.country || null,
        record_label: band.record_label || band.label || null,
        label_name: band.record_label || band.label || null,
        label: band.record_label || band.label || null,
        creator_id: band.creator_id || band.claimed_by_user_id || null,
        bio: band.bio || null,
        avatar_url: finalAvatarUrl || null,
        logo_url: finalAvatarUrl || null,
        cover_url: finalCoverUrl || null,
        banner_url: finalCoverUrl || null,
        spotify: band.spotify_url || null,
        spotify_url: band.spotify_url || null,
        bandcamp: band.bandcamp_url || null,
        bandcamp_url: band.bandcamp_url || null,
        metal_archives_url: band.metal_archives_url || null,
        featured_youtube_url: band.youtube_url || band.featured_youtube_url || null,
        youtube_url: band.youtube_url || band.featured_youtube_url || null,
        lineup: band.lineup || [],
        verification_status: band.verification_status || 'community_archive',
        is_verified: band.verification_status === 'verified_official',
        custom_slug: band.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
        updated_at: new Date().toISOString()
      };

      const cleanBandPayload = sanitizeBandPayload(rawBandPayload);

      const bandResult = await executeWithSchemaResilience(
        async (payload) => await client.from('bands').upsert([payload], { onConflict: 'id' }),
        cleanBandPayload
      );

      if (bandResult?.error) {
        console.warn('[communityBands] Band upsert notice:', bandResult.error);
      }

      // 2. Sync discography albums to 'releases' table
      if (Array.isArray(band.discography) && band.discography.length > 0) {
        for (const [idx, album] of band.discography.entries()) {
          const releaseId = ensureUUID(album.id || `rel-${bandUUID}-${idx}`);

          let albumCoverUrl = album.image_url;
          if (albumCoverUrl && albumCoverUrl.startsWith('data:image')) {
            try {
              const uploaded = await uploadBase64ToStorage(albumCoverUrl, 'releases', `${bandUUID}-${idx}`, 'cover');
              if (uploaded) albumCoverUrl = uploaded;
            } catch (err) {
              console.warn('[communityBands] Release artwork storage upload fallback:', err);
            }
          }

          const releasePayload: Record<string, any> = {
            id: releaseId,
            band_id: bandUUID,
            title: album.title,
            type: album.type || 'album',
            release_date: album.year || String(new Date().getFullYear()),
            cover_image: albumCoverUrl || null,
            cover_url: albumCoverUrl || null,
            tracks: album.tracks || [],
            label: album.label || album.release_info || null,
            catalog_id: album.catalog_id || null,
            genre: band.genre,
            status: 'active',
            updated_at: new Date().toISOString()
          };

          const releaseResult = await executeWithSchemaResilience(
            async (payload) => await client.from('releases').upsert([payload], { onConflict: 'id' }),
            releasePayload
          );

          if (releaseResult?.error) {
            console.warn('[communityBands] Release upsert notice:', releaseResult.error);
          }
        }
      }

      return { success: true };
    } catch (err: any) {
      console.warn('[communityBands] Error syncing to Supabase:', err);
      return { success: false, error: err?.message || 'Database sync error' };
    }
  }

  // Fetch live Supabase 'bands' and 'releases' rows and merge into community archives
  public async fetchFromSupabase(): Promise<CommunityBandRecord[]> {
    try {
      const client = getSupabase();
      if (!client) return this.getAll();

      const { data: bandsData, error: bandsErr } = await client
        .from('bands')
        .select('*')
        .order('created_at', { ascending: false });

      if (bandsErr || !bandsData || !Array.isArray(bandsData)) {
        return this.getAll();
      }

      const { data: releasesData } = await client
        .from('releases')
        .select('*');

      const all = this.getAll();
      const updatedList = [...all];

      for (const b of bandsData) {
        const bandName = b.band_name || b.name;
        if (!bandName) continue;

        // Find associated releases
        const matchingReleases = Array.isArray(releasesData)
          ? releasesData.filter((r: any) => r.band_id === b.id || (b.id && r.band_id === ensureUUID(b.id)))
          : [];

        const discography: DiscographyRelease[] = matchingReleases.map((r: any) => ({
          id: r.id,
          title: r.title || 'Untitled Release',
          year: r.release_date || '',
          type: (r.type?.toLowerCase() || 'album') as any,
          image_url: r.cover_image || r.cover_url || '',
          release_info: r.label || '',
          catalog_id: r.catalog_id || '',
          label: r.label || '',
          tracks: Array.isArray(r.tracks) ? r.tracks : []
        }));

        const existingIdx = updatedList.findIndex(
          (x) => x.id === b.id || x.name.toLowerCase().trim() === bandName.toLowerCase().trim()
        );

        let parsedLineup: LineupMember[] = [];
        if (Array.isArray(b.lineup)) {
          parsedLineup = b.lineup;
        } else if (typeof b.lineup === 'string') {
          try {
            const parsed = JSON.parse(b.lineup);
            if (Array.isArray(parsed)) parsedLineup = parsed;
          } catch {}
        }

        const microGenres = Array.isArray(b.micro_genres)
          ? b.micro_genres
          : typeof b.micro_genres === 'string'
          ? b.micro_genres.split(',').map((s: string) => s.trim())
          : [];

        const record: CommunityBandRecord = {
          id: b.id,
          name: bandName,
          genre: microGenres[0] || 'Extreme Metal',
          subgenres: microGenres,
          founded_year: b.founded_year || (existingIdx >= 0 ? updatedList[existingIdx].founded_year : ''),
          city: b.city || '',
          state: b.state_province || b.state || '',
          state_province: b.state_province || b.state || '',
          country: b.country || 'USA',
          record_label: b.record_label || b.label_name || b.label || (existingIdx >= 0 ? updatedList[existingIdx].record_label : ''),
          label: b.label || b.record_label || b.label_name || (existingIdx >= 0 ? updatedList[existingIdx].label : ''),
          creator_id: b.creator_id || (existingIdx >= 0 ? updatedList[existingIdx].creator_id : undefined),
          bio: b.bio || `Community-curated archive for ${bandName}.`,
          avatar_url: b.logo_url || b.avatar_url || '',
          cover_url: b.cover_url || b.banner_url || '',
          spotify_url: b.spotify || b.spotify_url || '',
          bandcamp_url: b.bandcamp || b.bandcamp_url || '',
          metal_archives_url: b.metal_archives_url || '',
          youtube_url: b.featured_youtube_url || b.youtube_url || '',
          featured_youtube_url: b.featured_youtube_url || b.youtube_url || '',
          lineup: parsedLineup.length > 0 ? parsedLineup : (existingIdx >= 0 ? updatedList[existingIdx].lineup : []),
          discography: discography.length > 0 ? discography : (existingIdx >= 0 ? updatedList[existingIdx].discography : []),
          curated_by: existingIdx >= 0 ? updatedList[existingIdx].curated_by : '@fan_archivist',
          curator_name: existingIdx >= 0 ? updatedList[existingIdx].curator_name : 'Community Archivist',
          created_at: b.created_at || new Date().toISOString(),
          verification_status: b.is_verified ? 'verified_official' : 'community_archive',
          followers_count: existingIdx >= 0 ? updatedList[existingIdx].followers_count : 120
        };

        if (existingIdx >= 0) {
          updatedList[existingIdx] = { ...updatedList[existingIdx], ...record };
        } else {
          updatedList.push(record);
        }
      }

      const seenIds = new Set<string>();
      const seenNames = new Set<string>();
      const dedupedList: CommunityBandRecord[] = [];

      for (const item of updatedList) {
        if (!item || !item.id) continue;
        const normName = (item.name || '').toLowerCase().trim();
        if (!seenIds.has(item.id) && (!normName || !seenNames.has(normName))) {
          seenIds.add(item.id);
          if (normName) seenNames.add(normName);
          dedupedList.push(item);
        }
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(dedupedList));
      return dedupedList;
    } catch (err) {
      console.warn('[communityBands] fetchFromSupabase exception:', err);
      return this.getAll();
    }
  }

  // Claim handover lifecycle: Handover archive to official band member
  public claimBandHandover(
    bandIdOrName: string,
    claimingUserId: string,
    mode: 'adopt_existing' | 'clean_slate'
  ): { success: boolean; bandRecord: CommunityBandRecord } {
    const all = this.getAll();
    const cleanSearch = bandIdOrName.toLowerCase().trim();
    const index = all.findIndex((b) => b.id === bandIdOrName || b.name.toLowerCase().trim() === cleanSearch);

    if (index === -1) {
      throw new Error(`Band ${bandIdOrName} not found in community archives.`);
    }

    const current = all[index];
    let updated: CommunityBandRecord;

    if (mode === 'clean_slate') {
      // Keep follower count and identity, reset fan-written bios and mock placeholders
      updated = {
        ...current,
        bio: '',
        discography: [],
        verification_status: 'verified_official',
        creator_id: claimingUserId,
        claimed_by_user_id: claimingUserId,
        claimed_at: new Date().toISOString()
      };
    } else {
      // Adopt and keep foundation
      updated = {
        ...current,
        verification_status: 'verified_official',
        creator_id: claimingUserId,
        claimed_by_user_id: claimingUserId,
        claimed_at: new Date().toISOString()
      };
    }

    all[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('nexus_community_bands_updated', { detail: updated }));

    // Proactively sync handover state
    this.syncToSupabaseTables(updated).catch(console.warn);

    return { success: true, bandRecord: updated };
  }
}

export const communityBandManager = CommunityBandManager.getInstance();
