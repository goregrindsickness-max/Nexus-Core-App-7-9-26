import { supabase } from '../lib/supabaseClient';
import { labelCatalogStore } from '../utils/indexedDB';

export interface ReleaseTrack {
  id: string;
  num?: string;
  title: string;
  duration?: string;
  lyrics?: string;
  audioUrl?: string;
  url?: string;
  isrc?: string;
  fileSize?: string;
  metrics?: Record<string, any>;
}

export interface CatalogRelease {
  id: string;
  catalogId?: string;
  title: string;
  coverColor?: string;
  type?: 'Album' | 'EP' | 'Demo' | 'Split' | 'Single' | string;
  releaseDate?: string;
  label?: string;
  genre?: string;
  coverImage?: string | null;
  coverUrl?: string | null;
  tracks?: ReleaseTrack[];
  formats?: {
    vinyl?: { warehouse_qty?: number; shelf_id?: string; variants?: any[] };
    cd?: { warehouse_qty?: number; shelf_id?: string };
    cassette?: { warehouse_qty?: number; shelf_id?: string };
    [key: string]: any;
  };
  digital?: any[];
  audio_vault_path?: string;
  band_id?: string;
  label_id?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch all releases from Supabase database 'releases' table
 */
export async function fetchReleasesFromDatabase(): Promise<CatalogRelease[]> {
  try {
    const { data, error } = await supabase
      .from('releases')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[releasesService] fetchReleases database notice:', error.message);
      return [];
    }

    if (data && Array.isArray(data)) {
      return data.map(row => ({
        id: row.id,
        catalogId: row.catalog_id || row.catalogId,
        title: row.title,
        coverColor: row.cover_color || row.coverColor,
        type: row.type || row.format_type || 'Album',
        releaseDate: row.release_date || row.releaseDate,
        label: row.label,
        genre: row.genre,
        coverImage: row.cover_image || row.cover_url || row.coverImage,
        coverUrl: row.cover_url || row.cover_image || row.coverUrl,
        tracks: Array.isArray(row.tracks) ? row.tracks : (typeof row.tracks === 'string' ? JSON.parse(row.tracks) : []),
        formats: typeof row.formats === 'object' && row.formats ? row.formats : (typeof row.formats === 'string' ? JSON.parse(row.formats) : {}),
        digital: Array.isArray(row.digital) ? row.digital : (typeof row.digital === 'string' ? JSON.parse(row.digital) : []),
        audio_vault_path: row.audio_vault_path,
        band_id: row.band_id,
        label_id: row.label_id,
        status: row.status || 'active',
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
    }
  } catch (err) {
    console.warn('[releasesService] Exception fetching releases from DB:', err);
  }
  return [];
}

/**
 * Upsert a release into the Supabase database 'releases' table with auto-healing and validation
 */
export async function upsertReleaseToDatabase(
  release: CatalogRelease,
  bandId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const targetBandId = String(bandId || release.band_id || 'b1').trim();
    const isValidUUID = (str?: string | null) => 
      str ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str) : false;

    const payload: Record<string, any> = {
      id: release.id,
      band_id: targetBandId,
      label_id: isValidUUID(release.label_id) ? release.label_id : null,
      title: release.title,
      catalog_id: release.catalogId || null,
      type: release.type || 'Album',
      release_date: release.releaseDate || null,
      label: release.label || null,
      genre: release.genre || null,
      cover_image: release.coverImage || release.coverUrl || null,
      cover_url: release.coverUrl || release.coverImage || null,
      cover_color: release.coverColor || null,
      tracks: release.tracks || [],
      formats: release.formats || {},
      digital: release.digital || [],
      audio_vault_path: release.audio_vault_path || null,
      status: release.status || 'active',
      updated_at: new Date().toISOString()
    };

    let { error } = await supabase
      .from('releases')
      .upsert(payload, { onConflict: 'id' });

    // Auto-heal: If foreign key constraint failed on 'bands', insert placeholder band and retry
    if (error && (error.message.includes('foreign key') || error.code === '23503')) {
      console.warn('[releasesService] Foreign key constraint on bands detected. Auto-provisioning band row:', targetBandId);
      try {
        await supabase
          .from('bands')
          .upsert({
            id: targetBandId,
            name: release.label || 'Nexus Artist',
            slug: targetBandId,
            status: 'active',
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });

        // Retry release upsert
        const retryResult = await supabase
          .from('releases')
          .upsert(payload, { onConflict: 'id' });
        
        error = retryResult.error;
      } catch (bandProvisionErr) {
        console.warn('[releasesService] Band auto-provision notice:', bandProvisionErr);
      }
    }

    if (error) {
      console.error('[releasesService] Database upsert error:', error.message, error);
      return { success: false, error: error.message };
    }

    console.log('[releasesService] Successfully persisted release to Supabase:', release.title);
    return { success: true };
  } catch (err: any) {
    console.error('[releasesService] Critical exception upserting release:', err);
    return { success: false, error: err?.message || 'Unknown exception' };
  }
}

/**
 * Delete a release from the Supabase database
 */
export async function deleteReleaseFromDatabase(releaseId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('releases')
      .delete()
      .eq('id', releaseId);

    if (error) {
      console.warn('[releasesService] Delete database error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[releasesService] Exception deleting release:', err);
    return false;
  }
}
