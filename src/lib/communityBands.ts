// Nexus Band Community & Verification Management
// Manages community archives, name collision checks, verification status, and artist handover forks

import {
  getSupabase,
  uploadBase64ToStorage,
  executeWithSchemaResilience,
  sanitizeBandPayload,
  ensureUUID,
  upsertReleasesBatchToDatabase
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
  founded_year?: string;
  city?: string;
  country?: string;
  state?: string;
  state_province?: string;
  record_label?: string;
  label?: string;
  bio?: string;
  avatar_url?: string;
  logo_url?: string;
  cover_url?: string;
  banner_url?: string;
  avatar?: string;
  image?: string;
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

  // Create or quick-edit a fan/community band page without official registration forms
  public upsertCommunityBand(band: Partial<CommunityBandRecord> & { name?: string; id?: string }): CommunityBandRecord {
    const all = this.getAll();
    const targetName = (band.name || (band as any).band_name || '').toLowerCase().trim();
    const targetCleanName = targetName.replace(/[^a-z0-9]/g, '');
    const targetUUID = band.id ? ensureUUID(band.id) : null;

    const existingIndex = all.findIndex((b) => {
      if (band.id && (b.id === band.id || ensureUUID(b.id) === targetUUID)) return true;
      if (targetName) {
        const bName = (b.name || (b as any).band_name || '').toLowerCase().trim();
        if (bName === targetName || bName.replace(/[^a-z0-9]/g, '') === targetCleanName) return true;
      }
      return false;
    });

    const now = new Date().toISOString();

    let result: CommunityBandRecord;

    const resolvedAvatar = band.avatar_url || band.logo_url || (band as any).avatar || (band as any).image;
    const resolvedCover = band.cover_url || band.banner_url || (band as any).banner || (band as any).cover;

    if (existingIndex >= 0) {
      const existing = all[existingIndex];
      const validName = (band.name || existing.name || (band as any).band_name || 'Nexus Artist').trim();
      const updated: CommunityBandRecord = {
        ...existing,
        ...band,
        id: band.id || existing.id,
        name: validName,
        band_name: validName,
        avatar_url: resolvedAvatar !== undefined ? resolvedAvatar : (existing.avatar_url || existing.logo_url),
        logo_url: resolvedAvatar !== undefined ? resolvedAvatar : (existing.logo_url || existing.avatar_url),
        avatar: resolvedAvatar !== undefined ? resolvedAvatar : (existing.avatar || existing.avatar_url),
        image: resolvedAvatar !== undefined ? resolvedAvatar : (existing.image || existing.avatar_url),
        cover_url: resolvedCover !== undefined ? resolvedCover : (existing.cover_url || existing.banner_url),
        banner_url: resolvedCover !== undefined ? resolvedCover : (existing.banner_url || existing.cover_url),
        founded_year: band.founded_year || existing.founded_year,
        city: band.city !== undefined ? band.city : existing.city,
        state: band.state !== undefined ? band.state : existing.state,
        state_province: band.state_province || band.state || existing.state_province || existing.state,
        country: band.country !== undefined ? band.country : existing.country,
        record_label: band.record_label || band.label || existing.record_label || existing.label,
        label: band.label || band.record_label || existing.label || existing.record_label,
        creator_id: band.creator_id || existing.creator_id,
        verification_status: band.verification_status || existing.verification_status || 'community_archive'
      };
      all[existingIndex] = updated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('nexus_community_bands_updated', { detail: updated }));
      window.dispatchEvent(new CustomEvent('nexus_avatar_updated', { detail: { avatar_url: updated.avatar_url, logo_url: updated.logo_url } }));
      result = updated;
    } else {
      const validName = (band.name || (band as any).band_name || 'Nexus Artist').trim();
      const newBand: CommunityBandRecord = {
        id: band.id || `comm-band-${Date.now()}`,
        name: validName,
        band_name: validName,
        genre: band.genre || 'Extreme Metal',
        subgenres: band.subgenres || [],
        founded_year: band.founded_year || '',
        city: band.city || '',
        state: band.state || '',
        state_province: band.state_province || band.state || '',
        country: band.country || 'USA',
        record_label: band.record_label || band.label || '',
        label: band.label || band.record_label || '',
        bio: band.bio || `Community-curated archive and discography for ${validName}.`,
        avatar_url: resolvedAvatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400',
        logo_url: resolvedAvatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400',
        avatar: resolvedAvatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400',
        image: resolvedAvatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400',
        cover_url: resolvedCover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200',
        banner_url: resolvedCover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200',
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
      window.dispatchEvent(new CustomEvent('nexus_avatar_updated', { detail: { avatar_url: newBand.avatar_url, logo_url: newBand.logo_url } }));
      result = newBand;
    }

    // Proactively sync band row to Supabase 'bands' table & 'releases' table
    this.syncToSupabaseTables(result).catch((e) => {
      console.warn('[communityBands] Supabase remote sync notice:', e);
    });

    return result;
  }

  // Background & explicit sync to live Supabase 'bands' & 'releases' tables and buckets
  public async syncToSupabaseTables(band: CommunityBandRecord | (Partial<CommunityBandRecord> & { id: string })): Promise<{ success: boolean; error?: string }> {
    try {
      const client = getSupabase();
      if (!client) {
        return { success: true };
      }

      // Ensure stable deterministic UUID for bands table
      const bandUUID = ensureUUID(band.id);
      const existing = this.getById(band.id) || (band.name ? this.findByName(band.name) : null);
      let resolvedBandName = (band.name || (band as any).band_name || existing?.name || existing?.band_name || '').trim();

      if (!resolvedBandName) {
        try {
          const archives = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
          const found = archives.find((b: any) => b.id === band.id || b.id === bandUUID);
          if (found?.name || found?.band_name) resolvedBandName = (found.name || found.band_name).trim();
        } catch {}
      }

      if (!resolvedBandName) {
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

      // Auto-upload base64 images to appropriate buckets if not already public URLs
      let finalAvatarUrl = band.avatar_url || (band as any).logo_url || (band as any).avatar || (band as any).image || existing?.avatar_url || existing?.logo_url;
      if (finalAvatarUrl && finalAvatarUrl.startsWith('data:image')) {
        try {
          const uploaded = await uploadBase64ToStorage(finalAvatarUrl, 'avatars', bandUUID, 'avatar');
          if (uploaded) finalAvatarUrl = uploaded;
        } catch (err) {
          console.warn('[communityBands] Avatar storage upload fallback:', err);
        }
      }

      let finalCoverUrl = band.cover_url || (band as any).banner_url || (band as any).banner || (band as any).cover || existing?.cover_url || existing?.banner_url;
      if (finalCoverUrl && finalCoverUrl.startsWith('data:image')) {
        try {
          const uploaded = await uploadBase64ToStorage(finalCoverUrl, 'bannersv2', bandUUID, 'banner');
          if (uploaded) finalCoverUrl = uploaded;
        } catch (err) {
          console.warn('[communityBands] Cover banner storage upload fallback:', err);
        }
      }

      // Update local storage record with the uploaded storage URLs
      const all = this.getAll();
      const idx = all.findIndex(b => b.id === band.id || ensureUUID(b.id) === bandUUID || (resolvedBandName && b.name.toLowerCase().trim() === resolvedBandName.toLowerCase().trim()));
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
      const rawBandPayload: Record<string, any> = {
        id: bandUUID,
        band_name: resolvedBandName,
        genre: band.genre || existing?.genre || 'Extreme Metal',
        subgenres: band.subgenres || existing?.subgenres || [],
        micro_genres: band.subgenres || existing?.subgenres || [],
        founded_year: band.founded_year || existing?.founded_year || null,
        city: band.city !== undefined ? band.city : (existing?.city || null),
        state: band.state || band.state_province || existing?.state || existing?.state_province || null,
        state_province: band.state_province || band.state || existing?.state_province || existing?.state || null,
        country: band.country !== undefined ? band.country : (existing?.country || null),
        record_label: band.record_label || band.label || existing?.record_label || existing?.label || null,
        label_name: band.record_label || band.label || existing?.record_label || existing?.label || null,
        label: band.record_label || band.label || existing?.record_label || existing?.label || null,
        creator_id: band.creator_id || band.claimed_by_user_id || existing?.creator_id || null,
        bio: band.bio !== undefined ? band.bio : (existing?.bio || null),
        avatar_url: finalAvatarUrl || null,
        logo_url: finalAvatarUrl || null,
        cover_url: finalCoverUrl || null,
        banner_url: finalCoverUrl || null,
        spotify: band.spotify_url || existing?.spotify_url || null,
        spotify_url: band.spotify_url || existing?.spotify_url || null,
        bandcamp: band.bandcamp_url || existing?.bandcamp_url || null,
        bandcamp_url: band.bandcamp_url || existing?.bandcamp_url || null,
        metal_archives_url: band.metal_archives_url || existing?.metal_archives_url || null,
        featured_youtube_url: band.youtube_url || band.featured_youtube_url || existing?.featured_youtube_url || existing?.youtube_url || null,
        youtube_url: band.youtube_url || band.featured_youtube_url || existing?.youtube_url || existing?.featured_youtube_url || null,
        lineup: band.lineup || existing?.lineup || [],
        verification_status: band.verification_status || existing?.verification_status || 'community_archive',
        is_verified: (band.verification_status === 'verified_official') || (existing?.verification_status === 'verified_official'),
        custom_slug: resolvedBandName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
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
              const uploaded = await uploadBase64ToStorage(albumCoverUrl, 'releases', `${bandUUID}-${idx}`, 'cover');
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
        } else {
          console.log(`[communityBands] Successfully synced discography (${releasePayloads.length} releases) for band "${resolvedBandName}" to Supabase.`);
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
        const cleanNormName = cleanBandName.replace(/[^a-z0-9]/g, '');

        const existingIdx = updatedList.findIndex((x) => {
          if (x.id === b.id || (b.id && ensureUUID(x.id) === b.id) || (b.id && ensureUUID(x.id) === ensureUUID(b.id))) return true;
          const xName = (x.name || (x as any).band_name || '').toLowerCase().trim();
          return xName === cleanBandName || xName.replace(/[^a-z0-9]/g, '') === cleanNormName;
        });

        const existingItem = existingIdx >= 0 ? updatedList[existingIdx] : null;

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

        const resolvedAvatar = b.logo_url || b.avatar_url || b.logo || b.avatar || b.image_url || existingItem?.avatar_url || existingItem?.logo_url || '';
        const resolvedCover = b.cover_url || b.banner_url || b.cover || b.banner || existingItem?.cover_url || existingItem?.banner_url || '';

        const record: CommunityBandRecord = {
          id: b.id,
          name: bandName,
          band_name: bandName,
          genre: microGenres[0] || b.genre || existingItem?.genre || 'Extreme Metal',
          subgenres: microGenres.length > 0 ? microGenres : (existingItem?.subgenres || []),
          founded_year: b.founded_year || existingItem?.founded_year || '',
          city: b.city || existingItem?.city || '',
          state: b.state_province || b.state || existingItem?.state_province || existingItem?.state || '',
          state_province: b.state_province || b.state || existingItem?.state_province || existingItem?.state || '',
          country: b.country || existingItem?.country || 'USA',
          record_label: b.record_label || b.label_name || b.label || existingItem?.record_label || existingItem?.label || '',
          label: b.label || b.record_label || b.label_name || existingItem?.label || existingItem?.record_label || '',
          creator_id: b.creator_id || existingItem?.creator_id,
          bio: b.bio || existingItem?.bio || `Community-curated archive for ${bandName}.`,
          avatar_url: resolvedAvatar,
          logo_url: resolvedAvatar,
          avatar: resolvedAvatar,
          image: resolvedAvatar,
          cover_url: resolvedCover,
          banner_url: resolvedCover,
          spotify_url: b.spotify || b.spotify_url || existingItem?.spotify_url || '',
          bandcamp_url: b.bandcamp || b.bandcamp_url || existingItem?.bandcamp_url || '',
          metal_archives_url: b.metal_archives_url || existingItem?.metal_archives_url || '',
          youtube_url: b.featured_youtube_url || b.youtube_url || existingItem?.youtube_url || '',
          featured_youtube_url: b.featured_youtube_url || b.youtube_url || existingItem?.featured_youtube_url || '',
          lineup: parsedLineup.length > 0 ? parsedLineup : (existingItem?.lineup || []),
          discography: discography.length > 0 ? discography : (existingItem?.discography || []),
          curated_by: existingItem?.curated_by || '@fan_archivist',
          curator_name: existingItem?.curator_name || 'Community Archivist',
          created_at: b.created_at || existingItem?.created_at || new Date().toISOString(),
          verification_status: b.is_verified ? 'verified_official' : (b.verification_status || existingItem?.verification_status || 'community_archive'),
          followers_count: existingItem?.followers_count || 120
        };

        if (existingIdx >= 0) {
          updatedList[existingIdx] = { ...existingItem, ...record };
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
        const normCleanName = normName.replace(/[^a-z0-9]/g, '');

        if (!seenIds.has(item.id) && (!normCleanName || !seenNames.has(normCleanName))) {
          seenIds.add(item.id);
          if (normCleanName) seenNames.add(normCleanName);
          dedupedList.push(item);
        } else {
          const existingDIdx = dedupedList.findIndex(
            (d) => d.id === item.id || (normCleanName && (d.name || '').toLowerCase().replace(/[^a-z0-9]/g, '') === normCleanName)
          );
          if (existingDIdx >= 0) {
            const currentD = dedupedList[existingDIdx];
            // Prioritize the entry that has a custom avatar/logo URL
            if ((!currentD.avatar_url && item.avatar_url) || (item.avatar_url && !item.avatar_url.includes('unsplash') && currentD.avatar_url?.includes('unsplash'))) {
              dedupedList[existingDIdx] = { ...currentD, ...item };
            }
          }
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
}

export const communityBandManager = CommunityBandManager.getInstance();
