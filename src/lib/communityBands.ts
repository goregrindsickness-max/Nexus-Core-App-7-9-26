// Nexus Band Community & Verification Management
// Manages community archives, name collision checks, verification status, and artist handover forks

import {
  getSupabase,
  uploadBase64ToStorage,
  executeWithSchemaResilience,
  sanitizeBandPayload,
  sanitizeMicroGenres,
  ensureUUID,
  generateUUID,
  upsertReleasesBatchToDatabase,
  upsertBandToDatabase,
  processOfflineQueue
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
  lyrics?: string;
}

export interface DiscographyRelease {
  id?: string;
  title: string;
  year: string;
  type: 'album' | 'ep' | 'single' | 'demo' | string;
  image_url?: string;
  cover_url?: string;
  cover_image?: string;
  coverUrl?: string;
  coverImage?: string;
  release_info?: string;
  catalog_id?: string;
  label?: string;
  tracks?: DiscographyTrack[];
}

export interface CommunityBandRecord {
  id: string;
  name: string;
  band_name?: string;
  genre: string;
  subgenres?: string[];
  micro_genres?: string[];
  founded_year?: string;
  city?: string;
  country?: string;
  state?: string;
  state_province?: string;
  record_label?: string;
  label?: string;
  label_name?: string;
  bio?: string;
  description?: string;
  avatar_url?: string;
  logo_url?: string;
  cover_url?: string;
  banner_url?: string;
  avatar?: string;
  image?: string;
  spotify?: string;
  spotify_url?: string;
  bandcamp?: string;
  bandcamp_url?: string;
  metal_archives?: string;
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
  is_locked?: boolean;
  locked_at?: string;
  locked_by?: string;
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
    avatar_url: 'https://cdn-images.dzcdn.net/images/cover/ed97fd7c37024f0eba98bd8149e191a9/1000x1000-000000-80-0-0.jpg',
    logo_url: 'https://cdn-images.dzcdn.net/images/cover/ed97fd7c37024f0eba98bd8149e191a9/1000x1000-000000-80-0-0.jpg',
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
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/4318493ee89a0417eb522b2c6b545464/1000x1000-000000-80-0-0.jpg',
        cover_image: 'https://cdn-images.dzcdn.net/images/cover/4318493ee89a0417eb522b2c6b545464/1000x1000-000000-80-0-0.jpg',
        coverUrl: 'https://cdn-images.dzcdn.net/images/cover/4318493ee89a0417eb522b2c6b545464/1000x1000-000000-80-0-0.jpg',
        image_url: 'https://cdn-images.dzcdn.net/images/cover/4318493ee89a0417eb522b2c6b545464/1000x1000-000000-80-0-0.jpg',
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
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/ed97fd7c37024f0eba98bd8149e191a9/1000x1000-000000-80-0-0.jpg',
        cover_image: 'https://cdn-images.dzcdn.net/images/cover/ed97fd7c37024f0eba98bd8149e191a9/1000x1000-000000-80-0-0.jpg',
        coverUrl: 'https://cdn-images.dzcdn.net/images/cover/ed97fd7c37024f0eba98bd8149e191a9/1000x1000-000000-80-0-0.jpg',
        image_url: 'https://cdn-images.dzcdn.net/images/cover/ed97fd7c37024f0eba98bd8149e191a9/1000x1000-000000-80-0-0.jpg',
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
    avatar_url: 'https://cdn-images.dzcdn.net/images/cover/489b6c23454d35864e1ad68180b1cd41/1000x1000-000000-80-0-0.jpg',
    logo_url: 'https://cdn-images.dzcdn.net/images/cover/489b6c23454d35864e1ad68180b1cd41/1000x1000-000000-80-0-0.jpg',
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
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/39236ca48c7ee6fa5a90a28998593ee9/1000x1000-000000-80-0-0.jpg',
        cover_image: 'https://cdn-images.dzcdn.net/images/cover/39236ca48c7ee6fa5a90a28998593ee9/1000x1000-000000-80-0-0.jpg',
        coverUrl: 'https://cdn-images.dzcdn.net/images/cover/39236ca48c7ee6fa5a90a28998593ee9/1000x1000-000000-80-0-0.jpg',
        image_url: 'https://cdn-images.dzcdn.net/images/cover/39236ca48c7ee6fa5a90a28998593ee9/1000x1000-000000-80-0-0.jpg',
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
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/5ff1e2efc0e93153860bea3cc82d652c/1000x1000-000000-80-0-0.jpg',
        cover_image: 'https://cdn-images.dzcdn.net/images/cover/5ff1e2efc0e93153860bea3cc82d652c/1000x1000-000000-80-0-0.jpg',
        coverUrl: 'https://cdn-images.dzcdn.net/images/cover/5ff1e2efc0e93153860bea3cc82d652c/1000x1000-000000-80-0-0.jpg',
        image_url: 'https://cdn-images.dzcdn.net/images/cover/5ff1e2efc0e93153860bea3cc82d652c/1000x1000-000000-80-0-0.jpg',
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
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/489b6c23454d35864e1ad68180b1cd41/1000x1000-000000-80-0-0.jpg',
        cover_image: 'https://cdn-images.dzcdn.net/images/cover/489b6c23454d35864e1ad68180b1cd41/1000x1000-000000-80-0-0.jpg',
        coverUrl: 'https://cdn-images.dzcdn.net/images/cover/489b6c23454d35864e1ad68180b1cd41/1000x1000-000000-80-0-0.jpg',
        image_url: 'https://cdn-images.dzcdn.net/images/cover/489b6c23454d35864e1ad68180b1cd41/1000x1000-000000-80-0-0.jpg',
        tracks: [
          { number: 1, title: 'Black Market Vasectomy', duration: '2:56' },
          { number: 2, title: 'Face Ripped Off', duration: '3:43' },
          { number: 3, title: 'Necrosexual Deviant', duration: '2:15' },
          { number: 4, title: 'Mortal Admonition', duration: '4:15' }
        ]
      },
      {
        id: 'rel-bogg-4',
        title: 'Hideous Aftermath',
        year: '2024',
        type: 'single',
        release_info: 'Century Media Records official single release.',
        catalog_id: 'CM-19810',
        label: 'Century Media',
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/ef0a0d5f18c123ad0550e24ac2b8ef95/1000x1000-000000-80-0-0.jpg',
        cover_image: 'https://cdn-images.dzcdn.net/images/cover/ef0a0d5f18c123ad0550e24ac2b8ef95/1000x1000-000000-80-0-0.jpg',
        coverUrl: 'https://cdn-images.dzcdn.net/images/cover/ef0a0d5f18c123ad0550e24ac2b8ef95/1000x1000-000000-80-0-0.jpg',
        image_url: 'https://cdn-images.dzcdn.net/images/cover/ef0a0d5f18c123ad0550e24ac2b8ef95/1000x1000-000000-80-0-0.jpg',
        tracks: [
          { number: 1, title: 'Hideous Aftermath', duration: '3:50' }
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
    avatar_url: 'https://cdn-images.dzcdn.net/images/cover/105a037bc9634f61844f16335166e605/1000x1000-000000-80-0-0.jpg',
    logo_url: 'https://cdn-images.dzcdn.net/images/cover/105a037bc9634f61844f16335166e605/1000x1000-000000-80-0-0.jpg',
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
        catalog_id: 'RR-6921',
        label: 'Relapse Records',
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/43a76a6508f78006c06d6c17b3c65b96/1000x1000-000000-80-0-0.jpg',
        cover_image: 'https://cdn-images.dzcdn.net/images/cover/43a76a6508f78006c06d6c17b3c65b96/1000x1000-000000-80-0-0.jpg',
        coverUrl: 'https://cdn-images.dzcdn.net/images/cover/43a76a6508f78006c06d6c17b3c65b96/1000x1000-000000-80-0-0.jpg',
        image_url: 'https://cdn-images.dzcdn.net/images/cover/43a76a6508f78006c06d6c17b3c65b96/1000x1000-000000-80-0-0.jpg',
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
        catalog_id: 'RR-6944',
        label: 'Relapse Records',
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/105a037bc9634f61844f16335166e605/1000x1000-000000-80-0-0.jpg',
        cover_image: 'https://cdn-images.dzcdn.net/images/cover/105a037bc9634f61844f16335166e605/1000x1000-000000-80-0-0.jpg',
        coverUrl: 'https://cdn-images.dzcdn.net/images/cover/105a037bc9634f61844f16335166e605/1000x1000-000000-80-0-0.jpg',
        image_url: 'https://cdn-images.dzcdn.net/images/cover/105a037bc9634f61844f16335166e605/1000x1000-000000-80-0-0.jpg',
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
        catalog_id: 'RR-6428',
        label: 'Relapse Records',
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/41ce0641e108b1bfd1d958ebcb6d129f/1000x1000-000000-80-0-0.jpg',
        cover_image: 'https://cdn-images.dzcdn.net/images/cover/41ce0641e108b1bfd1d958ebcb6d129f/1000x1000-000000-80-0-0.jpg',
        coverUrl: 'https://cdn-images.dzcdn.net/images/cover/41ce0641e108b1bfd1d958ebcb6d129f/1000x1000-000000-80-0-0.jpg',
        image_url: 'https://cdn-images.dzcdn.net/images/cover/41ce0641e108b1bfd1d958ebcb6d129f/1000x1000-000000-80-0-0.jpg',
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
    avatar_url: 'https://cdn-images.dzcdn.net/images/cover/4189a7fa9aeed62e27332f77a04b39cd/1000x1000-000000-80-0-0.jpg',
    logo_url: 'https://cdn-images.dzcdn.net/images/cover/4189a7fa9aeed62e27332f77a04b39cd/1000x1000-000000-80-0-0.jpg',
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
        catalog_id: 'RR-6473',
        label: 'Relapse Records',
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/175933355d5b0e826815a4ae10d80486/1000x1000-000000-80-0-0.jpg',
        cover_image: 'https://cdn-images.dzcdn.net/images/cover/175933355d5b0e826815a4ae10d80486/1000x1000-000000-80-0-0.jpg',
        coverUrl: 'https://cdn-images.dzcdn.net/images/cover/175933355d5b0e826815a4ae10d80486/1000x1000-000000-80-0-0.jpg',
        image_url: 'https://cdn-images.dzcdn.net/images/cover/175933355d5b0e826815a4ae10d80486/1000x1000-000000-80-0-0.jpg',
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
        catalog_id: 'RR-7193',
        label: 'Relapse Records',
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/e03eb6b69e377695520ab4fa8142522d/1000x1000-000000-80-0-0.jpg',
        cover_image: 'https://cdn-images.dzcdn.net/images/cover/e03eb6b69e377695520ab4fa8142522d/1000x1000-000000-80-0-0.jpg',
        coverUrl: 'https://cdn-images.dzcdn.net/images/cover/e03eb6b69e377695520ab4fa8142522d/1000x1000-000000-80-0-0.jpg',
        image_url: 'https://cdn-images.dzcdn.net/images/cover/e03eb6b69e377695520ab4fa8142522d/1000x1000-000000-80-0-0.jpg',
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
        catalog_id: 'RR-7521',
        label: 'Relapse Records',
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/4189a7fa9aeed62e27332f77a04b39cd/1000x1000-000000-80-0-0.jpg',
        cover_image: 'https://cdn-images.dzcdn.net/images/cover/4189a7fa9aeed62e27332f77a04b39cd/1000x1000-000000-80-0-0.jpg',
        coverUrl: 'https://cdn-images.dzcdn.net/images/cover/4189a7fa9aeed62e27332f77a04b39cd/1000x1000-000000-80-0-0.jpg',
        image_url: 'https://cdn-images.dzcdn.net/images/cover/4189a7fa9aeed62e27332f77a04b39cd/1000x1000-000000-80-0-0.jpg',
        tracks: [
          { number: 1, title: 'Enlighten Through Agony', duration: '3:49' },
          { number: 2, title: 'Compulsion for Cruelty', duration: '4:36' },
          { number: 3, title: 'Feast of Ashes', duration: '4:35' },
          { number: 4, title: 'Throw Them in the Van', duration: '1:42' },
          { number: 5, title: 'Unbridled Fury', duration: '3:30' }
        ]
      }
    ]
  },
  {
    id: 'comm-band-cordyceps',
    name: 'Cordyceps',
    band_name: 'Cordyceps',
    genre: 'Brutal Death Metal',
    subgenres: ['Technical Death Metal', 'Slam Death Metal', 'Extreme Metal'],
    founded_year: '2017',
    city: 'Las Vegas',
    state: 'NV',
    state_province: 'NV',
    country: 'USA',
    record_label: 'Unique Leader Records',
    label: 'Unique Leader Records',
    label_name: 'Unique Leader Records',
    bio: 'Brutal technical death metal powerhouse from Las Vegas, Nevada, signed to Unique Leader Records. Delivering bone-crushing slam grooves, hyper-technical guitar assault, blistering blast beats, and guttural vocal devastation across acclaimed records "Betrayal" and "Hell Inside".',
    avatar_url: 'https://cdn-images.dzcdn.net/images/cover/b3b64c39f28ecb3a1a9e69e46a782167/1000x1000-000000-80-0-0.jpg',
    logo_url: 'https://cdn-images.dzcdn.net/images/cover/b3b64c39f28ecb3a1a9e69e46a782167/1000x1000-000000-80-0-0.jpg',
    avatar: 'https://cdn-images.dzcdn.net/images/cover/b3b64c39f28ecb3a1a9e69e46a782167/1000x1000-000000-80-0-0.jpg',
    image: 'https://cdn-images.dzcdn.net/images/cover/b3b64c39f28ecb3a1a9e69e46a782167/1000x1000-000000-80-0-0.jpg',
    cover_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200',
    banner_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200',
    spotify_url: 'https://open.spotify.com/artist/5eL7qI7R6d3t9e0Vw3uP4a',
    metal_archives_url: 'https://www.metal-archives.com/bands/Cordyceps/3540465543',
    youtube_url: 'https://www.youtube.com/watch?v=0hY48qHjM7I',
    featured_youtube_url: 'https://www.youtube.com/watch?v=0hY48qHjM7I',
    verification_status: 'community_archive',
    curated_by: '@slam_archivist',
    curator_name: 'Vegas Death Metal Society',
    created_at: '2026-03-20T10:00:00Z',
    followers_count: 1420,
    lineup: [
      { id: 'cord-1', name: 'Rafael Gonzalez', role: 'Vocals', status: 'active', years: '2017–present' },
      { id: 'cord-2', name: 'DeLorean Nero', role: 'Lead Guitars', status: 'active', years: '2021–present' },
      { id: 'cord-3', name: 'Michael Nolan', role: 'Drums', status: 'active', years: '2020–present' },
      { id: 'cord-4', name: 'Chris Rosset', role: 'Bass', status: 'active', years: '2022–present' },
      { id: 'cord-5', name: 'Robert Jarman', role: 'Bass', status: 'past', years: '2017–2021' }
    ],
    discography: [
      {
        id: 'rel-cord-1',
        title: 'Betrayal',
        year: '2020',
        type: 'album',
        release_info: 'Debut full-length album released via Unique Leader Records featuring guest appearances by Mitch Harris.',
        catalog_id: 'ULR-342',
        label: 'Unique Leader Records',
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/b3b64c39f28ecb3a1a9e69e46a782167/1000x1000-000000-80-0-0.jpg',
        cover_image: 'https://cdn-images.dzcdn.net/images/cover/b3b64c39f28ecb3a1a9e69e46a782167/1000x1000-000000-80-0-0.jpg',
        coverUrl: 'https://cdn-images.dzcdn.net/images/cover/b3b64c39f28ecb3a1a9e69e46a782167/1000x1000-000000-80-0-0.jpg',
        image_url: 'https://cdn-images.dzcdn.net/images/cover/b3b64c39f28ecb3a1a9e69e46a782167/1000x1000-000000-80-0-0.jpg',
        tracks: [
          { number: 1, title: 'Cursed Are They', duration: '3:12' },
          { number: 2, title: 'Parallel Dissonance (feat. Mitch Harris)', duration: '3:45' },
          { number: 3, title: 'The Abyss', duration: '4:02' },
          { number: 4, title: 'Comatose Subservient', duration: '3:28' },
          { number: 5, title: 'Betrayal', duration: '3:55' },
          { number: 6, title: 'Maelstrom of Hypocrisy (feat. Mitch Harris)', duration: '4:10' },
          { number: 7, title: 'Cesspool of the Vicious', duration: '3:36' },
          { number: 8, title: 'Parasitic Degenerate', duration: '3:18' },
          { number: 9, title: 'Condemning the Path', duration: '4:22' },
          { number: 10, title: 'Black Mass (feat. Mitch Harris)', duration: '4:48' }
        ]
      },
      {
        id: 'rel-cord-2',
        title: 'Hell Inside',
        year: '2025',
        type: 'album',
        release_info: 'Sophomore studio album released on Unique Leader Records.',
        catalog_id: 'ULR-419',
        label: 'Unique Leader Records',
        cover_url: 'https://cdn-images.dzcdn.net/images/cover/6c6c74d6c44df9275a5e01b31dc248eb/1000x1000-000000-80-0-0.jpg',
        cover_image: 'https://cdn-images.dzcdn.net/images/cover/6c6c74d6c44df9275a5e01b31dc248eb/1000x1000-000000-80-0-0.jpg',
        coverUrl: 'https://cdn-images.dzcdn.net/images/cover/6c6c74d6c44df9275a5e01b31dc248eb/1000x1000-000000-80-0-0.jpg',
        image_url: 'https://cdn-images.dzcdn.net/images/cover/6c6c74d6c44df9275a5e01b31dc248eb/1000x1000-000000-80-0-0.jpg',
        tracks: [
          { number: 1, title: 'Filth', duration: '3:05' },
          { number: 2, title: 'Suffocating', duration: '3:34' },
          { number: 3, title: 'I Am Hate', duration: '3:40' },
          { number: 4, title: 'Diseased Mind', duration: '4:12' },
          { number: 5, title: 'Murder All', duration: '3:22' },
          { number: 6, title: 'Flock Of Sheep', duration: '3:48' },
          { number: 7, title: 'I Am The Plague', duration: '4:15' },
          { number: 8, title: 'Regret', duration: '3:50' },
          { number: 9, title: 'Obliterate', duration: '4:05' }
        ]
      }
    ]
  }
];

const STORAGE_KEY = 'nexus_community_band_archives';
const DELETED_STORAGE_KEY = 'nexus_deleted_community_bands';

function getDeletedBandIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed.map(String));
    }
  } catch {}
  return new Set();
}

function markBandDeletedInStorage(id: string): void {
  try {
    const current = getDeletedBandIds();
    current.add(String(id).trim());
    current.add(ensureUUID(String(id).trim()));
    localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(Array.from(current)));
  } catch {}
}

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
      // Clear any accidental deletion block for standard community bands like Cordyceps
      const deletedIds = getDeletedBandIds();
      if (deletedIds.has('comm-band-cordyceps') || deletedIds.has(ensureUUID('comm-band-cordyceps'))) {
        deletedIds.delete('comm-band-cordyceps');
        deletedIds.delete(ensureUUID('comm-band-cordyceps'));
        localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(Array.from(deletedIds)));
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COMMUNITY_BANDS));
      } else {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Verify and recover Cordyceps if missing from existing browser storage
          const hasCordyceps = parsed.some(b => {
            const bName = (b.name || (b as any).band_name || '').toLowerCase().trim();
            return bName === 'cordyceps' || b.id === 'comm-band-cordyceps';
          });
          if (!hasCordyceps) {
            const cordycepsBand = INITIAL_COMMUNITY_BANDS.find(b => b.id === 'comm-band-cordyceps');
            if (cordycepsBand) {
              parsed.push(cordycepsBand);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
            }
          }
        }
      }
    } catch (e) {
      console.warn('Error initializing community band archives:', e);
    }
  }

  public getAll(): CommunityBandRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const deletedIds = getDeletedBandIds();
      let list: CommunityBandRecord[] = [];
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) list = parsed;
        } catch {}
      }
      
      const initialMap = new Map(INITIAL_COMMUNITY_BANDS.map(b => [b.id, b]));

      // 1. Group records by canonical normalized name to filter out inferior duplicate entries
      const byNormalizedName = new Map<string, CommunityBandRecord[]>();
      let needsPruning = false;

      for (const item of list) {
        if (!item || !item.id) continue;
        if (deletedIds.has(item.id) || deletedIds.has(ensureUUID(item.id))) {
          needsPruning = true;
          continue;
        }

        const normName = (item.name || (item as any).band_name || '').toLowerCase().trim();
        if (!normName) continue;

        let processedItem = item;
        // If it's a pre-seeded band with unsplash placeholder, restore default high-res asset
        if (initialMap.has(item.id)) {
          const fresh = initialMap.get(item.id)!;
          const isStoredUnsplash = !item.avatar_url || item.avatar_url.includes('unsplash');
          processedItem = {
            ...item,
            avatar_url: isStoredUnsplash ? fresh.avatar_url : item.avatar_url,
            logo_url: isStoredUnsplash ? fresh.logo_url : (item.logo_url || fresh.logo_url),
            discography: item.discography?.length ? item.discography : fresh.discography
          };
        }

        const group = byNormalizedName.get(normName) || [];
        group.push(processedItem);
        byNormalizedName.set(normName, group);
      }

      // 2. Select the single best/canonical record for each band name
      const result: CommunityBandRecord[] = [];
      const seenIds = new Set<string>();
      const seenNames = new Set<string>();

      for (const [normName, group] of byNormalizedName.entries()) {
        if (group.length > 1) {
          needsPruning = true;
          // Score each candidate to pick the true/complete version (e.g. 12 releases over 6 releases)
          group.sort((a, b) => {
            const scoreA = (a.discography?.length || 0) * 10 +
              (a.lineup?.length || 0) * 2 +
              (a.is_locked ? 50 : 0) +
              (a.verification_status === 'verified_official' ? 30 : 0) +
              (a.creator_id ? 20 : 0) +
              (a.id.includes('-') && a.id.length >= 30 ? 15 : 0);

            const scoreB = (b.discography?.length || 0) * 10 +
              (b.lineup?.length || 0) * 2 +
              (b.is_locked ? 50 : 0) +
              (b.verification_status === 'verified_official' ? 30 : 0) +
              (b.creator_id ? 20 : 0) +
              (b.id.includes('-') && b.id.length >= 30 ? 15 : 0);

            return scoreB - scoreA;
          });
        }

        const winner = group[0];
        if (winner && !seenIds.has(winner.id)) {
          seenIds.add(winner.id);
          seenNames.add(normName);
          result.push(winner);
        }
      }

      // 3. Append any initial pre-seeded band that is missing from user's storage and not deleted
      for (const initBand of INITIAL_COMMUNITY_BANDS) {
        const initNormName = initBand.name.toLowerCase().trim();
        if (deletedIds.has(initBand.id) || deletedIds.has(ensureUUID(initBand.id))) continue;
        if (!seenIds.has(initBand.id) && !seenNames.has(initNormName)) {
          seenIds.add(initBand.id);
          seenNames.add(initNormName);
          result.push(initBand);
        }
      }

      // Auto-prune localStorage if duplicates or deleted items were purged
      if (needsPruning && result.length > 0) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
        } catch {}
      }

      return result.length > 0 ? result : INITIAL_COMMUNITY_BANDS;
    } catch {
      return INITIAL_COMMUNITY_BANDS;
    }
  }

  public findByName(name: string): CommunityBandRecord | null {
    if (!name || !name.trim()) return null;
    const clean = name.trim().toLowerCase();
    const cleanNorm = clean.replace(/[^a-z0-9]/g, '');
    const all = this.getAll();
    return all.find((b) => {
      const bName = (b.name || (b as any).band_name || '').toLowerCase();
      return bName === clean || bName.replace(/[^a-z0-9]/g, '') === cleanNorm;
    }) || null;
  }

  public findMatch(name: string): CommunityBandRecord | null {
    return this.findByName(name);
  }

  public getById(id: string): CommunityBandRecord | null {
    if (!id) return null;
    const cleanId = String(id).trim();
    const cleanUUID = ensureUUID(cleanId);
    const all = this.getAll();
    return all.find((b) => b.id === cleanId || ensureUUID(b.id) === cleanUUID) || null;
  }

  private saveToStorage(list: CommunityBandRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('LocalStorage quota exceeded when saving bands, pruning bulky base64 assets...', e);
      try {
        const pruned = list.map(b => ({
          ...b,
          avatar_url: b.avatar_url?.startsWith('data:') ? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400' : b.avatar_url,
          logo_url: b.logo_url?.startsWith('data:') ? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400' : b.logo_url,
          cover_url: b.cover_url?.startsWith('data:') ? 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200' : b.cover_url
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
      } catch (err2) {
        console.error('Critical storage failure:', err2);
      }
    }
  }

  // Create or quick-edit a fan/community band page without official registration forms
  public upsertCommunityBand(
    band: Partial<CommunityBandRecord> & { name?: string; id?: string },
    options?: { isNew?: boolean }
  ): CommunityBandRecord {
    const all = this.getAll();
    const candidateName = (band.name || (band as any).band_name || '').trim();
    const isExplicitNew = Boolean(options?.isNew);
    
    // 1. Exact ID lookup (only if not explicitly creating a brand-new band)
    let existingIndex = -1;
    if (!isExplicitNew && band.id) {
      existingIndex = all.findIndex((b) => b.id === band.id);
      if (existingIndex < 0) {
        const targetUUID = ensureUUID(band.id);
        existingIndex = all.findIndex((b) => ensureUUID(b.id) === targetUUID);
      }
    }

    // 2. Canonical Name lookup if not found by ID (only when NOT explicitly creating a new band)
    if (!isExplicitNew && existingIndex < 0 && candidateName && candidateName.toLowerCase() !== 'nexus artist') {
      const cleanCandidate = candidateName.toLowerCase().trim();
      existingIndex = all.findIndex((b) => {
        const bName = (b.name || (b as any).band_name || '').toLowerCase().trim();
        return bName === cleanCandidate;
      });
    }

    const now = new Date().toISOString();
    let result: CommunityBandRecord;

    const resolvedAvatar = band.avatar_url || band.logo_url || (band as any).avatar || (band as any).image;
    const resolvedCover = band.cover_url || band.banner_url || (band as any).banner || (band as any).cover;

    if (existingIndex >= 0 && !isExplicitNew) {
      const existing = all[existingIndex];
      const validName = (candidateName || existing.name || 'Nexus Artist').trim();
      const updatedMicroGenres = band.micro_genres || band.subgenres || existing.micro_genres || existing.subgenres || [];
      
      // Preserve discography: if incoming discography is not passed or empty while existing has releases, retain existing
      let discographyToSave: DiscographyRelease[];
      if (Array.isArray(band.discography) && band.discography.length > 0) {
        discographyToSave = band.discography;
      } else if (existing.discography && existing.discography.length > 0) {
        discographyToSave = existing.discography;
      } else {
        discographyToSave = band.discography || [];
      }

      // Preserve lineup: if incoming lineup is not passed or empty while existing has members, retain existing
      let lineupToSave: LineupMember[];
      if (Array.isArray(band.lineup) && band.lineup.length > 0) {
        lineupToSave = band.lineup;
      } else if (existing.lineup && existing.lineup.length > 0) {
        lineupToSave = existing.lineup;
      } else {
        lineupToSave = band.lineup || [];
      }

      // Lock state resolution
      const isLockedState = band.is_locked !== undefined ? Boolean(band.is_locked) : Boolean(existing.is_locked);
      const lockedAtState = isLockedState ? (band.locked_at || existing.locked_at || new Date().toISOString()) : undefined;
      const lockedByState = isLockedState ? (band.locked_by || existing.locked_by) : undefined;

      const updated: CommunityBandRecord = {
        ...existing,
        ...band,
        id: existing.id,
        name: validName,
        band_name: validName,
        genre: band.genre || existing.genre || 'Extreme Metal',
        micro_genres: updatedMicroGenres,
        subgenres: updatedMicroGenres,
        avatar_url: (resolvedAvatar !== undefined && resolvedAvatar !== '') ? resolvedAvatar : (existing.avatar_url || existing.logo_url),
        logo_url: (resolvedAvatar !== undefined && resolvedAvatar !== '') ? resolvedAvatar : (existing.logo_url || existing.avatar_url),
        avatar: (resolvedAvatar !== undefined && resolvedAvatar !== '') ? resolvedAvatar : (existing.avatar || existing.avatar_url),
        image: (resolvedAvatar !== undefined && resolvedAvatar !== '') ? resolvedAvatar : (existing.image || existing.avatar_url),
        cover_url: (resolvedCover !== undefined && resolvedCover !== '') ? resolvedCover : (existing.cover_url || existing.banner_url),
        banner_url: (resolvedCover !== undefined && resolvedCover !== '') ? resolvedCover : (existing.banner_url || existing.cover_url),
        founded_year: (band.founded_year !== undefined && band.founded_year !== '') ? band.founded_year : existing.founded_year,
        city: (band.city !== undefined && band.city !== '') ? band.city : existing.city,
        state: (band.state !== undefined && band.state !== '') ? band.state : existing.state,
        state_province: band.state_province || band.state || existing.state_province || existing.state,
        country: (band.country !== undefined && band.country !== '') ? band.country : existing.country,
        record_label: band.record_label || band.label || band.label_name || existing.record_label || existing.label,
        label: band.label || band.record_label || band.label_name || existing.label || existing.record_label,
        label_name: band.label_name || band.record_label || band.label || existing.label_name || existing.record_label,
        bio: (band.bio !== undefined && band.bio.trim() !== '') ? band.bio : (existing.bio || (existing as any).description || ''),
        spotify_url: band.spotify_url || band.spotify || existing.spotify_url || existing.spotify || '',
        bandcamp_url: band.bandcamp_url || band.bandcamp || existing.bandcamp_url || existing.bandcamp || '',
        metal_archives_url: band.metal_archives_url || existing.metal_archives_url || '',
        youtube_url: band.youtube_url || band.featured_youtube_url || existing.youtube_url || existing.featured_youtube_url || '',
        featured_youtube_url: band.featured_youtube_url || band.youtube_url || existing.featured_youtube_url || existing.youtube_url || '',
        lineup: lineupToSave,
        discography: discographyToSave,
        creator_id: band.creator_id || existing.creator_id,
        verification_status: band.verification_status || existing.verification_status || 'community_archive',
        is_locked: isLockedState,
        locked_at: lockedAtState,
        locked_by: lockedByState
      };
      all[existingIndex] = updated;
      this.saveToStorage(all);
      window.dispatchEvent(new CustomEvent('nexus_community_bands_updated', { detail: updated }));
      window.dispatchEvent(new CustomEvent('nexus_avatar_updated', { detail: { avatar_url: updated.avatar_url, logo_url: updated.logo_url } }));
      result = updated;
    } else {
      // BRAND NEW ENTRY - Guaranteed unique fresh UUID, never matching fallback strings or overwriting existing items
      const newId = (band.id && !all.some(b => b.id === band.id || ensureUUID(b.id) === ensureUUID(band.id)))
        ? ensureUUID(band.id)
        : generateUUID();

      const validName = (candidateName || 'Nexus Artist').trim();
      const initialMicroGenres = band.micro_genres || band.subgenres || (band.genre ? [band.genre] : ['Extreme Metal']);
      const isLockedState = Boolean(band.is_locked);

      const newBand: CommunityBandRecord = {
        id: newId,
        name: validName,
        band_name: validName,
        genre: band.genre || 'Extreme Metal',
        micro_genres: initialMicroGenres,
        subgenres: initialMicroGenres,
        founded_year: band.founded_year || '',
        city: band.city || '',
        state: band.state || '',
        state_province: band.state_province || band.state || '',
        country: band.country || 'USA',
        record_label: band.record_label || band.label || band.label_name || '',
        label: band.label || band.record_label || band.label_name || '',
        label_name: band.label_name || band.record_label || band.label || '',
        bio: band.bio || `Community-curated archive and discography for ${validName}.`,
        avatar_url: resolvedAvatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400',
        logo_url: resolvedAvatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400',
        avatar: resolvedAvatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400',
        image: resolvedAvatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400',
        cover_url: resolvedCover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200',
        banner_url: resolvedCover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200',
        spotify_url: band.spotify_url || band.spotify || '',
        bandcamp_url: band.bandcamp_url || band.bandcamp || '',
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
        followers_count: band.followers_count || 120,
        is_locked: isLockedState,
        locked_at: isLockedState ? (band.locked_at || now) : undefined,
        locked_by: isLockedState ? band.locked_by : undefined
      };
      all.unshift(newBand);
      this.saveToStorage(all);
      window.dispatchEvent(new CustomEvent('nexus_community_bands_updated', { detail: newBand }));
      window.dispatchEvent(new CustomEvent('nexus_avatar_updated', { detail: { avatar_url: newBand.avatar_url, logo_url: newBand.logo_url } }));
      result = newBand;
    }

    // Proactively sync band row to Supabase 'bands' table & 'releases' table
    this.syncToSupabaseTables(result).catch((e) => {
      console.warn('[communityBands] Supabase remote sync notice:', e);
    });

    return result;
  }

  // Explicit manual lock toggle for community archives
  public async toggleLock(bandId: string, isLocked: boolean, userHandle?: string): Promise<CommunityBandRecord | null> {
    const all = this.getAll();
    const targetUUID = ensureUUID(bandId);
    const idx = all.findIndex(b => b.id === bandId || ensureUUID(b.id) === targetUUID);
    if (idx < 0) return null;

    const existing = all[idx];
    const now = new Date().toISOString();
    const updated: CommunityBandRecord = {
      ...existing,
      is_locked: isLocked,
      locked_at: isLocked ? now : undefined,
      locked_by: isLocked ? (userHandle || existing.curated_by || '@curator') : undefined
    };

    all[idx] = updated;
    this.saveToStorage(all);

    window.dispatchEvent(new CustomEvent('nexus_community_bands_updated', { detail: updated }));

    try {
      await this.syncToSupabaseTables(updated);
    } catch (err) {
      console.warn('[communityBands] toggleLock remote sync notice:', err);
    }

    return updated;
  }

  // Safe delete method that guards locked archives and purges from local and Supabase storage
  public deleteCommunityBand(bandId: string, force?: boolean): { success: boolean; error?: string } {
    const all = this.getAll();
    const targetUUID = ensureUUID(bandId);
    const idx = all.findIndex(b => b.id === bandId || ensureUUID(b.id) === targetUUID);
    if (idx < 0) return { success: false, error: 'Band archive not found.' };

    const band = all[idx];
    if (band.is_locked && !force) {
      return { success: false, error: `Archive "${band.name}" is locked & protected against deletion. Unlock the archive before removing it.` };
    }

    // Record in deleted tracking set to prevent resurrection from cached payloads
    markBandDeletedInStorage(band.id);
    if (bandId !== band.id) markBandDeletedInStorage(bandId);

    const remaining = all.filter(b => b.id !== band.id && ensureUUID(b.id) !== targetUUID);
    this.saveToStorage(remaining);

    // Delete remote Supabase records asynchronously if client is active
    try {
      const client = getSupabase();
      if (client) {
        Promise.resolve(client.from('releases').delete().or(`band_id.eq.${band.id},band_id.eq.${targetUUID}`)).catch(() => {});
        Promise.resolve(client.from('bands').delete().or(`id.eq.${band.id},id.eq.${targetUUID}`)).catch(() => {});
      }
    } catch {}

    window.dispatchEvent(new CustomEvent('nexus_community_bands_updated', { detail: { id: band.id, deleted: true } }));
    return { success: true };
  }

  // Background & explicit sync to live Supabase 'bands' & 'releases' tables and buckets
  public async syncToSupabaseTables(
    band: CommunityBandRecord | (Partial<CommunityBandRecord> & { id: string }),
    options?: { isNew?: boolean }
  ): Promise<{ success: boolean; error?: string }> {
    const dispatchSyncLog = (message: string) => {
      console.log(`[Supabase Band Sync] ${message}`);
      try {
        window.dispatchEvent(new CustomEvent('nexus_band_sync_log', {
          detail: { message, timestamp: Date.now() }
        }));
      } catch {}
    };

    try {
      dispatchSyncLog('Initializing Supabase connection & resolving band name...');
      const client = getSupabase();
      if (!client) {
        dispatchSyncLog('Notice: Supabase client unavailable (offline / mock mode).');
        return { success: true };
      }

      const isExplicitNew = Boolean(options?.isNew);

      // Ensure stable deterministic UUID for bands table
      const bandUUID = (isExplicitNew || !band.id || band.id.startsWith('comm-band-'))
        ? (band.id ? ensureUUID(band.id) : generateUUID())
        : ensureUUID(band.id);

      const existing = !isExplicitNew ? (this.getById(band.id || '') || (band.name ? this.findByName(band.name) : null)) : null;
      let resolvedBandName = (band.name || (band as any).band_name || existing?.name || existing?.band_name || '').trim();

      if (!resolvedBandName && !isExplicitNew) {
        try {
          const archives = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
          const found = archives.find((b: any) => b.id === band.id || b.id === bandUUID);
          if (found?.name || found?.band_name) resolvedBandName = (found.name || found.band_name).trim();
        } catch {}
      }

      if (!resolvedBandName && !isExplicitNew) {
        try {
          const activeBandRaw = localStorage.getItem('nexus_active_band');
          if (activeBandRaw) {
            const parsed = JSON.parse(activeBandRaw);
            if (parsed?.name || parsed?.band_name) resolvedBandName = (parsed.name || parsed.band_name).trim();
          }
        } catch {}
      }

      if (!resolvedBandName) {
        resolvedBandName = 'Nexus Artist';
      }

      dispatchSyncLog(`Resolved target band "${resolvedBandName}" (UUID: ${bandUUID}, Mode: ${isExplicitNew ? 'INSERT' : 'UPDATE/UPSERT'}). Checking storage assets...`);

      // Auto-upload base64 images to appropriate buckets if not already public URLs
      let finalAvatarUrl = band.avatar_url || (band as any).logo_url || (band as any).avatar || (band as any).image || existing?.avatar_url || existing?.logo_url;
      if (finalAvatarUrl && finalAvatarUrl.startsWith('data:image')) {
        try {
          dispatchSyncLog('Uploading avatar image to Supabase storage bucket...');
          const uploaded = await uploadBase64ToStorage(finalAvatarUrl, 'community-bands', bandUUID, 'avatar');
          if (uploaded) {
            finalAvatarUrl = uploaded;
            dispatchSyncLog('Avatar successfully uploaded to storage.');
          }
        } catch (err) {
          console.warn('[communityBands] Avatar storage upload fallback:', err);
          dispatchSyncLog('Avatar storage upload warning (using data URI fallback).');
        }
      }

      let finalCoverUrl = band.cover_url || (band as any).banner_url || (band as any).banner || (band as any).cover || existing?.cover_url || existing?.banner_url;
      if (finalCoverUrl && finalCoverUrl.startsWith('data:image')) {
        try {
          dispatchSyncLog('Uploading cover banner image to Supabase storage bucket...');
          const uploaded = await uploadBase64ToStorage(finalCoverUrl, 'community-bands', bandUUID, 'banner');
          if (uploaded) {
            finalCoverUrl = uploaded;
            dispatchSyncLog('Cover banner successfully uploaded to storage.');
          }
        } catch (err) {
          console.warn('[communityBands] Cover banner storage upload fallback:', err);
          dispatchSyncLog('Cover banner storage upload warning.');
        }
      }

      // Update local storage record with the uploaded storage URLs
      const all = this.getAll();
      const idx = all.findIndex(b => b.id === band.id || ensureUUID(b.id) === bandUUID);
      if (idx >= 0) {
        all[idx] = {
          ...all[idx],
          avatar_url: finalAvatarUrl || all[idx].avatar_url,
          logo_url: finalAvatarUrl || all[idx].logo_url,
          avatar: finalAvatarUrl || all[idx].avatar,
          image: finalAvatarUrl || all[idx].image,
          cover_url: finalCoverUrl || all[idx].cover_url,
          banner_url: finalCoverUrl || all[idx].banner_url
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      }

      // 1. Sync to 'bands' table using schema resilience & sanitization with guaranteed non-null band_name
      const parsedYear = (band.founded_year !== undefined && band.founded_year !== null && String(band.founded_year).trim() !== '')
        ? parseInt(String(band.founded_year), 10)
        : ((existing?.founded_year !== undefined && existing?.founded_year !== null && String(existing?.founded_year).trim() !== '')
            ? parseInt(String(existing.founded_year), 10)
            : null);
      const validFoundedYear = (parsedYear && !isNaN(parsedYear) && parsedYear > 0) ? parsedYear : null;

      const rawBandGenres = band.micro_genres || band.subgenres || existing?.micro_genres || existing?.subgenres || (band.genre ? [band.genre] : ['Extreme Metal']);
      const sanitizedBandGenres = sanitizeMicroGenres(rawBandGenres);

      const rawRecordLabel = (band.record_label || band.label || band.label_name || existing?.record_label || existing?.label || existing?.label_name || '').trim() || null;

      const rawBandPayload: Record<string, any> = {
        id: bandUUID,
        band_name: resolvedBandName,
        name: resolvedBandName,
        micro_genres: sanitizedBandGenres,
        founded_year: validFoundedYear,
        city: band.city !== undefined ? (band.city ? String(band.city).trim() : null) : (existing?.city || null),
        state_province: band.state_province || band.state || existing?.state_province || existing?.state || null,
        country: band.country !== undefined ? (band.country ? String(band.country).trim() : null) : (existing?.country || null),
        record_label: rawRecordLabel,
        creator_id: band.creator_id || band.claimed_by_user_id || existing?.creator_id || null,
        bio: band.bio !== undefined ? (band.bio ? String(band.bio).trim() : '') : (existing?.bio || null),
        logo_url: finalAvatarUrl || null,
        cover_url: finalCoverUrl || null,
        spotify: band.spotify || band.spotify_url || existing?.spotify || existing?.spotify_url || null,
        bandcamp: band.bandcamp || band.bandcamp_url || existing?.bandcamp || existing?.bandcamp_url || null,
        metal_archives_url: band.metal_archives_url || existing?.metal_archives_url || null,
        featured_youtube_url: band.featured_youtube_url || band.youtube_url || existing?.featured_youtube_url || existing?.youtube_url || null,
        lineup: band.lineup || existing?.lineup || [],
        is_verified: (band as any).is_verified !== undefined ? Boolean((band as any).is_verified) : (((band as any).verification_status === 'verified_official') || (existing as any)?.is_verified || false),
        is_locked: (band as any).is_locked !== undefined ? Boolean((band as any).is_locked) : (existing?.is_locked !== undefined ? Boolean(existing.is_locked) : false),
        locked_at: (band as any).locked_at || existing?.locked_at || null,
        locked_by: (band as any).locked_by || existing?.locked_by || null,
        custom_slug: resolvedBandName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
        updated_at: new Date().toISOString()
      };

      dispatchSyncLog(`Executing upsertBandToDatabase (isNew: ${isExplicitNew})...`);
      const bandResult = await upsertBandToDatabase(rawBandPayload, { isNew: isExplicitNew });

      if (bandResult?.error) {
        console.error('[communityBands] Band upsert error:', bandResult.error);
        dispatchSyncLog(`❌ Band sync error: ${bandResult.error}`);
      } else {
        dispatchSyncLog(`✅ Band "${resolvedBandName}" synchronized to database successfully.`);
      }

      // Direct Supabase call fallback
      try {
        if (isExplicitNew) {
          const directRes = await client.from('bands').insert([rawBandPayload]);
          if (directRes.error && !directRes.error.message?.includes('duplicate key')) {
            console.error('[communityBands] Direct Supabase insert error:', directRes.error);
            dispatchSyncLog(`Direct insert notice: ${directRes.error.message || JSON.stringify(directRes.error)}`);
          }
        } else {
          const directRes = await client.from('bands').upsert([rawBandPayload], { onConflict: 'id' });
          if (directRes.error) {
            console.error('[communityBands] Direct Supabase upsert error:', directRes.error);
            dispatchSyncLog(`Direct upsert notice: ${directRes.error.message || JSON.stringify(directRes.error)}`);
          }
        }
      } catch (err: any) {
        console.error('[communityBands] Direct Supabase operation exception:', err);
        dispatchSyncLog(`Direct operation exception: ${err?.message || err}`);
      }

      try {
        dispatchSyncLog('Flushing offline sync queue via processOfflineQueue()...');
        await processOfflineQueue();
        dispatchSyncLog('Offline sync queue flushed successfully.');
      } catch (err: any) {
        console.warn('[communityBands] Offline queue flush notice:', err);
        dispatchSyncLog(`Offline queue flush warning: ${err?.message || err}`);
      }

      if (bandResult?.error) {
        console.error('[communityBands] Band database sync error:', bandResult.error);
        dispatchSyncLog(`❌ Band database sync error: ${bandResult.error}`);
        return { success: false, error: bandResult.error };
      }

      // Broadcast update events across all UI listeners
      window.dispatchEvent(new CustomEvent('nexus_community_bands_updated', {
        detail: {
          ...band,
          id: band.id,
          avatar_url: finalAvatarUrl,
          logo_url: finalAvatarUrl,
          cover_url: finalCoverUrl,
          banner_url: finalCoverUrl
        }
      }));
      window.dispatchEvent(new CustomEvent('nexus_avatar_updated', {
        detail: {
          avatar_url: finalAvatarUrl,
          logo_url: finalAvatarUrl
        }
      }));

      // 2. Sync discography albums to 'releases' table with strict batch upsert & duplicate filtering
      if (Array.isArray(band.discography) && band.discography.length > 0) {
        dispatchSyncLog(`Syncing discography (${band.discography.length} albums/releases) to Supabase "releases" table...`);
        const releasePayloads: any[] = [];
        const seenReleaseIds = new Set<string>();

        for (const [idx, album] of band.discography.entries()) {
          const releaseId = ensureUUID(album.id || `rel-${bandUUID}-${idx}-${Date.now()}`);
          if (seenReleaseIds.has(releaseId)) {
            continue;
          }
          seenReleaseIds.add(releaseId);

          let albumCoverUrl = album.cover_url || album.cover_image || album.coverUrl || album.coverImage || album.image_url || null;
          if (albumCoverUrl && albumCoverUrl.startsWith('data:image')) {
            try {
              const uploaded = await uploadBase64ToStorage(albumCoverUrl, 'community-bands', `${bandUUID}-${idx}`, 'cover');
              if (uploaded) albumCoverUrl = uploaded;
            } catch (err) {
              console.warn('[communityBands] Release artwork storage upload fallback:', err);
            }
          }

          releasePayloads.push({
            id: releaseId,
            band_id: bandUUID,
            title: album.title || `Release ${idx + 1}`,
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
          });
        }

        const batchResult = await upsertReleasesBatchToDatabase(releasePayloads, bandUUID);

        if (!batchResult.success) {
          console.error('[communityBands] Batch discography releases upsert rejected:', batchResult.error);
          dispatchSyncLog(`Discography sync error: ${batchResult.error}`);
          return { success: false, error: batchResult.error };
        } else {
          dispatchSyncLog(`Success! Synchronized ${releasePayloads.length} release(s) for "${resolvedBandName}" to Supabase.`);
        }
      }

      dispatchSyncLog(`Success! Band "${resolvedBandName}" fully synced to Supabase.`);
      return { success: true };
    } catch (err: any) {
      console.warn('[communityBands] Error syncing to Supabase:', err);
      dispatchSyncLog(`Sync failed: ${err?.message || 'Database sync error'}`);
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
        let bandName = b.band_name || b.name;
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
          cover_url: r.cover_url || r.cover_image || r.coverUrl || r.coverImage || r.image_url || '',
          cover_image: r.cover_image || r.cover_url || r.coverImage || r.coverUrl || r.image_url || '',
          coverUrl: r.cover_url || r.cover_image || r.coverUrl || r.coverImage || r.image_url || '',
          coverImage: r.cover_image || r.cover_url || r.coverImage || r.coverUrl || r.image_url || '',
          image_url: r.cover_image || r.cover_url || r.coverImage || r.coverUrl || r.image_url || '',
          release_info: r.label || '',
          catalog_id: r.catalog_id || '',
          label: r.label || '',
          tracks: Array.isArray(r.tracks) ? r.tracks : []
        }));

        const cleanBandName = bandName.toLowerCase().trim();

        // Match existing band by ID (exact or UUID) or exact canonical name (if non-empty and not placeholder)
        const existingIdx = updatedList.findIndex((x) => {
          if (x.id === b.id || (b.id && ensureUUID(x.id) === b.id)) return true;
          const xName = (x.name || (x as any).band_name || '').toLowerCase().trim();
          if (xName && cleanBandName && xName === cleanBandName && xName !== 'nexus artist') return true;
          return false;
        });

        const existingItem = existingIdx >= 0 ? updatedList[existingIdx] : null;

        // Protect against accidental label name corruption (e.g. 'Underground Label')
        if (cleanBandName === 'underground label') {
          if (existingItem?.name && existingItem.name.toLowerCase() !== 'underground label') {
            bandName = existingItem.name;
          } else if (b.bio && b.bio.includes('archive and discography for ')) {
            const bioMatch = b.bio.match(/archive and discography for\s+([^.]+)/i);
            if (bioMatch && bioMatch[1]) bandName = bioMatch[1].trim();
          }
        }

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

        const resolvedAvatar = (b.logo_url && !b.logo_url.includes('unsplash'))
          ? b.logo_url
          : (b.avatar_url && !b.avatar_url.includes('unsplash'))
          ? b.avatar_url
          : (existingItem?.avatar_url && !existingItem.avatar_url.includes('unsplash'))
          ? existingItem.avatar_url
          : (existingItem?.logo_url && !existingItem.logo_url.includes('unsplash'))
          ? existingItem.logo_url
          : (b.logo_url || b.avatar_url || existingItem?.avatar_url || existingItem?.logo_url || '');

        const resolvedCover = (b.cover_url && !b.cover_url.includes('unsplash'))
          ? b.cover_url
          : (b.banner_url && !b.banner_url.includes('unsplash'))
          ? b.banner_url
          : (existingItem?.cover_url && !existingItem.cover_url.includes('unsplash'))
          ? existingItem.cover_url
          : (existingItem?.banner_url && !existingItem.banner_url.includes('unsplash'))
          ? existingItem.banner_url
          : (b.cover_url || b.banner_url || existingItem?.cover_url || existingItem?.banner_url || '');

        const isExistingLocked = Boolean(existingItem?.is_locked);

        // Intelligently merge discography without dropping local releases or tracks
        const mergedDiscography: DiscographyRelease[] = [];
        const localReleases = existingItem?.discography || [];
        const seenReleaseKeys = new Set<string>();

        // 1. Add all local releases first (they have user's authentic tracks, lyrics, covers)
        for (const locRel of localReleases) {
          const key = (locRel.title || '').toLowerCase().trim();
          seenReleaseKeys.add(key);
          if (locRel.id) seenReleaseKeys.add(locRel.id);
          mergedDiscography.push(locRel);
        }

        // 2. Append any remote releases that aren't already present locally
        for (const remRel of discography) {
          const titleKey = (remRel.title || '').toLowerCase().trim();
          const idKey = remRel.id || '';
          if (!seenReleaseKeys.has(titleKey) && !seenReleaseKeys.has(idKey)) {
            seenReleaseKeys.add(titleKey);
            if (idKey) seenReleaseKeys.add(idKey);
            mergedDiscography.push(remRel);
          }
        }

        // Merge lineup non-destructively
        const mergedLineup: LineupMember[] = (existingItem?.lineup && existingItem.lineup.length > 0)
          ? existingItem.lineup
          : (parsedLineup.length > 0 ? parsedLineup : []);

        const resolvedIsLocked = isExistingLocked || Boolean(b.is_locked);
        const resolvedLockedAt = resolvedIsLocked ? (existingItem?.locked_at || b.locked_at || new Date().toISOString()) : undefined;
        const resolvedLockedBy = resolvedIsLocked ? (existingItem?.locked_by || b.locked_by) : undefined;

        const record: CommunityBandRecord = {
          id: existingItem?.id || b.id, // Retain existing local ID if matched to avoid splitting records
          name: (isExistingLocked && existingItem?.name) ? existingItem.name : bandName,
          band_name: (isExistingLocked && existingItem?.name) ? existingItem.name : bandName,
          genre: (isExistingLocked && existingItem?.genre) ? existingItem.genre : (microGenres[0] || b.genre || existingItem?.genre || 'Extreme Metal'),
          subgenres: (isExistingLocked && existingItem?.subgenres?.length) ? existingItem.subgenres : (microGenres.length > 0 ? microGenres : (existingItem?.subgenres || [])),
          founded_year: (isExistingLocked && existingItem?.founded_year) ? existingItem.founded_year : (b.founded_year || existingItem?.founded_year || ''),
          city: (isExistingLocked && existingItem?.city) ? existingItem.city : (b.city || existingItem?.city || ''),
          state: (isExistingLocked && existingItem?.state) ? existingItem.state : (b.state_province || b.state || existingItem?.state_province || existingItem?.state || ''),
          state_province: (isExistingLocked && existingItem?.state_province) ? existingItem.state_province : (b.state_province || b.state || existingItem?.state_province || existingItem?.state || ''),
          country: (isExistingLocked && existingItem?.country) ? existingItem.country : (b.country || existingItem?.country || 'USA'),
          record_label: (isExistingLocked && existingItem?.record_label) ? existingItem.record_label : (b.record_label || b.label_name || b.label || existingItem?.record_label || existingItem?.label || ''),
          label: (isExistingLocked && existingItem?.label) ? existingItem.label : (b.label || b.record_label || b.label_name || existingItem?.label || existingItem?.record_label || ''),
          creator_id: b.creator_id || existingItem?.creator_id,
          bio: (() => {
            if (isExistingLocked && existingItem?.bio) return existingItem.bio;
            if (existingItem?.bio && !existingItem.bio.startsWith('Community-curated archive')) return existingItem.bio;
            if (b.bio && !b.bio.startsWith('Community-curated archive')) return b.bio;
            return b.bio || (existingItem?.bio) || `Community-curated archive for ${bandName}.`;
          })(),
          avatar_url: (isExistingLocked && existingItem?.avatar_url) ? existingItem.avatar_url : resolvedAvatar,
          logo_url: (isExistingLocked && existingItem?.logo_url) ? existingItem.logo_url : resolvedAvatar,
          avatar: (isExistingLocked && existingItem?.avatar) ? existingItem.avatar : resolvedAvatar,
          image: (isExistingLocked && existingItem?.image) ? existingItem.image : resolvedAvatar,
          cover_url: (isExistingLocked && existingItem?.cover_url) ? existingItem.cover_url : resolvedCover,
          banner_url: (isExistingLocked && existingItem?.banner_url) ? existingItem.banner_url : resolvedCover,
          spotify_url: (isExistingLocked && existingItem?.spotify_url) ? existingItem.spotify_url : (b.spotify || b.spotify_url || existingItem?.spotify_url || ''),
          bandcamp_url: (isExistingLocked && existingItem?.bandcamp_url) ? existingItem.bandcamp_url : (b.bandcamp || b.bandcamp_url || existingItem?.bandcamp_url || ''),
          metal_archives_url: (isExistingLocked && existingItem?.metal_archives_url) ? existingItem.metal_archives_url : (b.metal_archives_url || existingItem?.metal_archives_url || ''),
          youtube_url: (isExistingLocked && existingItem?.youtube_url) ? existingItem.youtube_url : (b.featured_youtube_url || b.youtube_url || existingItem?.youtube_url || ''),
          featured_youtube_url: (isExistingLocked && existingItem?.featured_youtube_url) ? existingItem.featured_youtube_url : (b.featured_youtube_url || b.youtube_url || existingItem?.featured_youtube_url || ''),
          lineup: mergedLineup,
          discography: mergedDiscography.length > 0 ? mergedDiscography : (existingItem?.discography || []),
          curated_by: existingItem?.curated_by || '@fan_archivist',
          curator_name: existingItem?.curator_name || 'Community Archivist',
          created_at: b.created_at || existingItem?.created_at || new Date().toISOString(),
          verification_status: b.is_verified ? 'verified_official' : (b.verification_status || existingItem?.verification_status || 'community_archive'),
          followers_count: existingItem?.followers_count || 120,
          is_locked: resolvedIsLocked,
          locked_at: resolvedLockedAt,
          locked_by: resolvedLockedBy
        };

        if (existingIdx >= 0) {
          updatedList[existingIdx] = record;
        } else {
          updatedList.push(record);
        }
      }

      const deletedIds = getDeletedBandIds();
      const byNormalizedName = new Map<string, CommunityBandRecord[]>();

      for (const item of updatedList) {
        if (!item || !item.id) continue;
        if (deletedIds.has(item.id) || deletedIds.has(ensureUUID(item.id))) continue;
        const normName = (item.name || (item as any).band_name || '').toLowerCase().trim();
        if (!normName) continue;

        const group = byNormalizedName.get(normName) || [];
        group.push(item);
        byNormalizedName.set(normName, group);
      }

      const dedupedList: CommunityBandRecord[] = [];
      const seenIds = new Set<string>();

      for (const group of byNormalizedName.values()) {
        if (group.length > 1) {
          group.sort((a, b) => {
            const scoreA = (a.discography?.length || 0) * 10 +
              (a.lineup?.length || 0) * 2 +
              (a.is_locked ? 50 : 0) +
              (a.verification_status === 'verified_official' ? 30 : 0) +
              (a.creator_id ? 20 : 0) +
              (a.id.includes('-') && a.id.length >= 30 ? 15 : 0);

            const scoreB = (b.discography?.length || 0) * 10 +
              (b.lineup?.length || 0) * 2 +
              (b.is_locked ? 50 : 0) +
              (b.verification_status === 'verified_official' ? 30 : 0) +
              (b.creator_id ? 20 : 0) +
              (b.id.includes('-') && b.id.length >= 30 ? 15 : 0);

            return scoreB - scoreA;
          });
        }

        const winner = group[0];
        if (winner && !seenIds.has(winner.id)) {
          seenIds.add(winner.id);
          dedupedList.push(winner);
        }
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(dedupedList));
      return dedupedList;
    } catch (err) {
      console.warn('[communityBands] fetchFromSupabase exception:', err);
      return this.getAll();
    }
  }

  // Claim handover lifecycle: Handover archive to official band member with 100% data preservation
  public claimBandHandover(
    bandIdOrName: string,
    claimingUserId: string,
    mode?: string
  ): { success: boolean; bandRecord: CommunityBandRecord } {
    const all = this.getAll();
    const cleanSearch = bandIdOrName.toLowerCase().trim();
    const index = all.findIndex((b) => b.id === bandIdOrName || b.name.toLowerCase().trim() === cleanSearch);

    if (index === -1) {
      throw new Error(`Band ${bandIdOrName} not found in community archives.`);
    }

    const current = all[index];

    // Preserve 100% of existing community profile data (discography, lineup, bio, artwork, links, followers)
    const updated: CommunityBandRecord = {
      ...current,
      verification_status: 'verified_official',
      creator_id: claimingUserId,
      claimed_by_user_id: claimingUserId,
      claimed_at: new Date().toISOString()
    };

    all[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('nexus_community_bands_updated', { detail: updated }));

    // Proactively sync handover state to Supabase
    this.syncToSupabaseTables(updated).catch(console.warn);

    return { success: true, bandRecord: updated };
  }

  // Update specific fields of a band profile (e.g. cover art, bio, links) with guaranteed band_name
  public async updateBand(bandId: string, updates: Partial<CommunityBandRecord>): Promise<CommunityBandRecord> {
    const existing = this.getById(bandId) || (updates.name ? this.findByName(updates.name) : null);
    const resolvedName = (updates.name || (updates as any).band_name || existing?.name || existing?.band_name || 'Nexus Artist').trim();
    
    const updatedRecord = this.upsertCommunityBand({
      ...updates,
      id: bandId,
      name: resolvedName,
      band_name: resolvedName
    });

    await this.syncToSupabaseTables(updatedRecord);
    return updatedRecord;
  }

  // Quick helper to update cover banner artwork
  public async updateCoverArt(bandId: string, coverUrl: string): Promise<CommunityBandRecord> {
    return this.updateBand(bandId, { cover_url: coverUrl });
  }

  // Quick helper to update avatar/logo artwork
  public async updateAvatar(bandId: string, avatarUrl: string): Promise<CommunityBandRecord> {
    return this.updateBand(bandId, { avatar_url: avatarUrl });
  }

  // Push all local community bands and discographies to Supabase tables with unique UUIDs
  public async syncAllToSupabase(progressCallback?: (curr: number, total: number, bandName: string) => void): Promise<{ success: boolean; syncedCount: number; errors: string[] }> {
    const all = this.getAll();
    let syncedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < all.length; i++) {
      const b = all[i];
      try {
        progressCallback?.(i + 1, all.length, b.name);
        const res = await this.syncToSupabaseTables(b);
        if (res.success) {
          syncedCount++;
        } else if (res.error) {
          errors.push(`${b.name}: ${res.error}`);
        }
      } catch (err: any) {
        errors.push(`${b.name}: ${err?.message || err}`);
      }
    }

    return { success: errors.length === 0, syncedCount, errors };
  }
}

export const communityBandManager = CommunityBandManager.getInstance();
