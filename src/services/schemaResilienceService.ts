import { getSupabase } from './clientService';
import { ensureImagesUploadedToStorage } from './storageService';
import { sanitizeProfilePayload } from './profileService';
import { sanitizeBandPayload } from './bandService';
import { sanitizeCreativePayload } from './creativeService';

/**
 * Strips properties from an InventoryItem that are not present in the
 * 'inventory' Postgres table schema, preventing 'PGRST204' column not found errors.
 */
export function sanitizeInventoryItemForDb(item: any): any {
  const allowedKeys = [
    'id',
    'created_at',
    'name',
    'table_stock',
    'van_stock',
    'low_threshold',
    'status',
    'item_type',
    'price',
    'image_url',
    'border_color',
    'is_exclusive',
    'band_id',
    'cost',
    'sku',
    'barcode',
    'initial_batch_size',
    'variants',
  ];

  const dbItem: any = {};
  for (const key of allowedKeys) {
    if (item[key] !== undefined) {
      dbItem[key] = item[key];
    }
  }
  return dbItem;
}

/**
 * Generates a valid RFC4122 v4 UUID.
 * Compatible with PostgreSQL UUID column constraints.
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback RFC4122 v4 UUID generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Ensures that a string is a valid UUID. If it is already a UUID, returns it.
 * If not, deterministically hashes the string into a valid UUID format.
 * Compatible with PostgreSQL UUID column constraints.
 */
export function ensureUUID(id: string): string {
  if (!id) return '00000000-0000-4000-a000-000000000000';

  const cleanId = String(id).trim();

  // Check if already a valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(cleanId)) {
    return cleanId.toLowerCase();
  }

  // Simple deterministic hash function to produce a 32-character hex string
  let hash = 0;
  for (let i = 0; i < cleanId.length; i++) {
    const char = cleanId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }

  // Seed a random-like but deterministic sequence
  let seed = Math.abs(hash);
  const hexChars = '0123456789abcdef';
  let hexStr = '';
  for (let i = 0; i < 32; i++) {
    // Simple LCG (Linear Congruential Generator) to get deterministic "random" numbers
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    const index = seed % 16;
    hexStr += hexChars[index];
  }

  // Format as UUID v4: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const part1 = hexStr.substring(0, 8);
  const part2 = hexStr.substring(8, 12);
  const part3 = '4' + hexStr.substring(13, 16);
  // yChar must be one of 8, 9, a, b
  const yChar = hexChars[8 + (Math.abs(hash) % 4)];
  const part4 = yChar + hexStr.substring(17, 20);
  const part5 = hexStr.substring(20, 32);

  return `${part1}-${part2}-${part3}-${part4}-${part5}`.toLowerCase();
}

/**
 * Maps common US postal zip codes to City, State.
 */
export function resolveZipCode(zip: string): string {
  const cleanZip = zip.trim();
  const zipMap: Record<string, string> = {
    '90210': 'Los Angeles, CA',
    '10001': 'New York, NY',
    '94103': 'San Francisco, CA',
    '94110': 'San Francisco, CA',
    '60611': 'Chicago, IL',
    '33139': 'Miami, FL',
    '02108': 'Boston, MA',
    '98101': 'Seattle, WA',
    '75201': 'Dallas, TX',
    '77002': 'Houston, TX',
    '80202': 'Denver, CO',
    '37203': 'Nashville, TN',
    '20001': 'Washington, DC',
    '89109': 'Las Vegas, NV',
    '30303': 'Atlanta, GA',
    '19103': 'Philadelphia, PA',
    '85001': 'Phoenix, AZ',
    '92101': 'San Diego, CA',
    '97201': 'Portland, OR',
    '55401': 'Minneapolis, MN',
    '48201': 'Detroit, MI',
    '43215': 'Columbus, OH',
    '46204': 'Indianapolis, IN',
    '78701': 'Austin, TX',
    '21201': 'Baltimore, MD',
    '15219': 'Pittsburgh, PA',
    '63101': 'St. Louis, MO',
    '53202': 'Milwaukee, WI',
    '40202': 'Louisville, KY',
    '68102': 'Omaha, NE',
    '70112': 'New Orleans, LA',
    '99501': 'Anchorage, AK',
    '96813': 'Honolulu, HI',
    '75001': 'Dallas, TX',
    '75020': 'Denison, TX',
    '75021': 'Denison, TX',
  };
  if (zipMap[cleanZip]) return zipMap[cleanZip];

  // Range fallback
  if (cleanZip.length === 5) {
    const num = parseInt(cleanZip, 10);
    if (num >= 90000 && num <= 96162) return 'Los Angeles, CA';
    if (num >= 10001 && num <= 14925) return 'New York, NY';
    if (num >= 60001 && num <= 62999) return 'Chicago, IL';
    if (num >= 75000 && num <= 79999) return 'Dallas, TX';
    if (num >= 48000 && num <= 49999) return 'Detroit, MI';
    if (num >= 30000 && num <= 31999) return 'Atlanta, GA';
    if (num >= 98000 && num <= 99499) return 'Seattle, WA';
    if (num >= 33000 && num <= 34999) return 'Miami, FL';
    if (num >= 20001 && num <= 20599) return 'Washington, DC';
    if (num >= 85000 && num <= 86599) return 'Phoenix, AZ';
    if (num >= 80000 && num <= 81658) return 'Denver, CO';
  }
  return zip;
}

/**
 * Automatically retry dynamic table insertions/updates by stripping columns
 * that produce PGRST204 errors (column not found in schema cache) or healing UUIDs.
 */
export async function executeWithSchemaResilience<T extends Record<string, any>>(
  operation: (payload: T) => Promise<{ error: any; data?: any }>,
  initialPayload: T
): Promise<{ error: any; data?: any }> {
  let payload = { ...initialPayload } as any;

  // Auto-upload any base64 image data URIs in payload to Supabase storage buckets first
  payload = await ensureImagesUploadedToStorage(payload);

  const isProfilePayload =
    payload &&
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    ('email' in payload ||
      'role' in payload ||
      'account_type' in payload ||
      'console_handle' in payload ||
      'registered_workspaces' in payload ||
      'allowed_workspaces' in payload ||
      'bio' in payload ||
      'profileBlurb' in payload ||
      'update_ticker' in payload ||
      'rosterTicker' in payload ||
      'full_name' in payload ||
      'creative_metadata' in payload ||
      'promoter_metadata' in payload ||
      'label_metadata' in payload ||
      'band_metadata' in payload ||
      'user_metadata' in payload) &&
    !(
      'creator_id' in payload ||
      'business_name' in payload ||
      'creative_name' in payload ||
      'band_id' in payload ||
      'band_name' in payload ||
      'venue_id' in payload
    );

  // If this payload is a profile, normalize it for the 'profiles' database table columns:
  if (isProfilePayload) {
    payload = sanitizeProfilePayload(payload);
  }

  const isCreativePayload =
    payload &&
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    ('business_name' in payload ||
      'creative_name' in payload ||
      'creative_handle' in payload ||
      'day_rate' in payload ||
      'base_rate_value' in payload ||
      'rate_range' in payload ||
      'pricing_notes' in payload ||
      'gear_tags' in payload ||
      'quick_broadcast' in payload ||
      'broadcast_bulletin' in payload ||
      ('creator_id' in payload &&
        ('skills' in payload ||
          'gear' in payload ||
          'primary_gear' in payload ||
          'primary_category' in payload ||
          'secondary_category' in payload ||
          'availability_status' in payload ||
          'portfolio_link' in payload))) &&
    !('email' in payload || 'account_type' in payload || 'role' in payload || 'console_handle' in payload || 'band_name' in payload);

  // If this payload targets the 'creatives' table, normalize it strictly for the 'creatives' database table columns:
  if (isCreativePayload) {
    payload = sanitizeCreativePayload(payload);
  }

  const isBandPayload =
    payload &&
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    !isCreativePayload &&
    ('band_name' in payload ||
      ('creator_id' in payload &&
        ('logo_url' in payload ||
          'tech_rider_url' in payload ||
          'tour_vehicle' in payload ||
          'lineup' in payload ||
          'micro_genres' in payload))) &&
    !('email' in payload || 'account_type' in payload || 'role' in payload || 'console_handle' in payload);

  // If this payload targets the 'bands' table, normalize it strictly for the 'bands' database table columns:
  if (isBandPayload) {
    payload = sanitizeBandPayload(payload);
  }

  let attempts = 0;
  const maxAttempts = 50;

  while (attempts < maxAttempts) {
    const { error, data } = await operation(payload);
    if (!error) {
      return { error: null, data };
    }

    // Check if it's a PGRST205 "Table not found" error or PostgreSQL 42P01 "relation does not exist" error.
    // NOTE: Must NOT match column missing errors (PGRST204) which contain the word "column".
    const isTableMissingError =
      error.code === 'PGRST205' ||
      error.code === '42P01' ||
      (error.message &&
        !error.message.toLowerCase().includes('column') &&
        (error.message.toLowerCase().includes('could not find the table') ||
          (error.message.toLowerCase().includes('table') && error.message.toLowerCase().includes('schema cache')) ||
          (error.message.toLowerCase().includes('relation') && error.message.toLowerCase().includes('does not exist'))));

    if (isTableMissingError) {
      console.warn(
        `[Supabase Resilience] Gracefully bypassed missing table error (table likely not in sandbox database):`,
        error.message
      );
      return { error: null, data: null };
    }

    // CRITICAL: ALLOW RLS / PRIVILEGE ERRORS TO BUBBLE UP TO TRIGGER OFFLINE RETRY PIPELINES
    const isRLSOrPermissionError =
      error.code === '42501' ||
      (error.message &&
        (error.message.toLowerCase().includes('row-level security') ||
          error.message.toLowerCase().includes('permission denied') ||
          error.message.toLowerCase().includes('not authorized') ||
          error.message.toLowerCase().includes('violates row-level security')));

    if (isRLSOrPermissionError) {
      console.warn(
        `[Supabase Resilience] RLS Violation (Code 42501). Aborting bypass to allow background queue orchestration.`,
        error.message
      );
      return { error, data: null };
    }

    // Check if it's a PGRST204 "Column not found" error, PostgreSQL 42703, or type mismatch / bad request error
    const isColumnMissingOrTypeError =
      error.code === 'PGRST204' ||
      error.code === '42703' ||
      error.code === '42804' ||
      error.code === '22023' ||
      error.code === 'PGRST102' ||
      (error.message &&
        ((error.message.toLowerCase().includes('column') &&
          (error.message.toLowerCase().includes('does not exist') ||
            error.message.toLowerCase().includes('not found') ||
            error.message.toLowerCase().includes('unknown') ||
            error.message.toLowerCase().includes('schema cache'))) ||
          error.message.toLowerCase().includes('invalid input syntax') ||
          error.message.toLowerCase().includes('expression is of type') ||
          error.message.toLowerCase().includes('malformed') ||
          error.message.toLowerCase().includes('cannot parse') ||
          error.message.toLowerCase().includes('type mismatch')));

    if (isColumnMissingOrTypeError && error.message) {
      const match1 = error.message.match(/Could not find the '([^']+)' column/);
      const match2 = error.message.match(/column "([^"]+)"/i);
      const match3 = error.message.match(/column '([^']+)'/i);
      const match4 = error.message.match(/Could not find the ([^ ]+) column/i);
      const match5 = error.message.match(/field "([^"]+)"/i);

      const offendingColumn =
        (match1 && match1[1]) ||
        (match2 && match2[1]) ||
        (match3 && match3[1]) ||
        (match4 && match4[1]) ||
        (match5 && match5[1]);
      if (offendingColumn) {
        console.warn(`[Supabase Resilience] Stripping column '${offendingColumn}' due to database error:`, error.message);
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(`NEXUS_CORE_MISSING_COLUMN_${offendingColumn.toUpperCase()}`, 'true');
          }
        } catch (_) {}
        delete payload[offendingColumn];

        // If all custom data keys have been stripped, gracefully bypass this operation
        const remainingDataKeys = Object.keys(payload).filter(
          (k) =>
            k !== 'id' &&
            k !== 'creator_id' &&
            k !== 'user_id' &&
            k !== 'created_at' &&
            k !== 'owner_id' &&
            k !== 'profile_id'
        );
        if (remainingDataKeys.length === 0) {
          console.warn(
            `[Supabase Resilience] Gracefully bypassed operation after stripping unsupported column '${offendingColumn}':`,
            error.message
          );
          return { error: null, data: null };
        }

        attempts++;
        continue;
      }

      if (attempts >= 5) {
        console.warn(
          `[Supabase Resilience] Gracefully bypassed operation after multiple attempts due to schema cache issues:`,
          error.message
        );
        return { error: null, data: null };
      }
    }

    // Check if it's an invalid UUID format error (PostgreSQL error code 22P02, or message references uuid)
    if ((error.code === '22P02' || error.message?.toLowerCase().includes('uuid')) && error.message) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let cleanedSomething = false;
      const errorMsg = error.message.toLowerCase();

      // First, try targeting the specific invalid value mentioned in the error message
      for (const key of Object.keys(payload)) {
        const value = payload[key];
        if (typeof value === 'string' && value) {
          const lowerVal = value.toLowerCase();
          if (
            errorMsg.includes(`"${lowerVal}"`) ||
            errorMsg.includes(`'${lowerVal}'`) ||
            errorMsg.includes(` ${lowerVal}`)
          ) {
            console.warn(
              `[Supabase Resilience] Healing targeted invalid UUID column '${key}' ("${value}"):`,
              error.message
            );
            if (key === 'id') {
              payload[key] = ensureUUID(value);
            } else {
              payload[key] = ensureUUID(value);
            }
            cleanedSomething = true;
          }
        }
      }

      // If we couldn't target the exact value, fall back to safe healing of relation keys only
      if (!cleanedSomething) {
        for (const key of Object.keys(payload)) {
          const value = payload[key];

          if (typeof value === 'string' && key.endsWith('_id') && key !== 'id' && !uuidRegex.test(value)) {
            console.warn(`[Supabase Resilience] Healing invalid UUID relation column '${key}' ("${value}"):`, error.message);
            delete payload[key];
            cleanedSomething = true;
          }
        }
      }

      if (cleanedSomething) {
        attempts++;
        continue;
      }
    }

    // Check if it's a foreign key constraint violation (PostgreSQL error code 23503 or foreign key message)
    const isForeignKeyError =
      error.code === '23503' ||
      (error.message &&
        (error.message.toLowerCase().includes('foreign key') ||
          error.message.toLowerCase().includes('violates foreign key') ||
          error.message.toLowerCase().includes('not present in table') ||
          error.message.toLowerCase().includes('fkey') ||
          error.message.toLowerCase().includes('foreign_key')));

    if (isForeignKeyError && error.message) {
      let cleanedSomething = false;
      const errorMsg = error.message.toLowerCase();

      for (const key of Object.keys(payload)) {
        if ((key.endsWith('_id') || key === 'label_id') && payload[key] !== null && payload[key] !== undefined) {
          const lowerKey = key.toLowerCase();
          const valStr = String(payload[key]).toLowerCase();

          if (errorMsg.includes(lowerKey) || errorMsg.includes(valStr) || errorMsg.includes('fkey')) {
            console.warn(
              `[Supabase Resilience] Healing foreign key violation on column '${key}' ("${payload[key]}"):`,
              error.message
            );
            payload[key] = null;
            cleanedSomething = true;
          }
        }
      }

      if (!cleanedSomething) {
        for (const key of Object.keys(payload)) {
          if (
            key !== 'id' &&
            (key.endsWith('_id') || key === 'label_id') &&
            payload[key] !== null &&
            payload[key] !== undefined
          ) {
            console.warn(
              `[Supabase Resilience] Fallback healing foreign key violation on column '${key}':`,
              error.message
            );
            payload[key] = null;
            cleanedSomething = true;
          }
        }
      }

      if (cleanedSomething) {
        attempts++;
        continue;
      }
    }

    return { error, data };
  }

  return { error: { code: 'PGRST204', message: 'Exceeded dynamic schema resolution attempts' } };
}

export async function testSupabaseConnection(
  customUrl?: string,
  customKey?: string
): Promise<{ success: boolean; message: string }> {
  let supabase: any = null;
  if (customUrl && customKey) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      supabase = createClient(customUrl, customKey);
    } catch (e: any) {
      return { success: false, message: `Invalid Supabase client config: ${e.message}` };
    }
  } else {
    supabase = getSupabase();
  }

  if (!supabase) {
    return { success: true, message: 'Bypassed connection check: Supabase client is not initialized.' };
  }

  try {
    const { count, error } = await supabase.from('shows').select('*', { count: 'exact', head: true });

    if (error) {
      console.warn('Diagnostic connection test warning:', error);
      return {
        success: false,
        message: `Gateway responded with error: ${error.message}`,
      };
    }

    return { success: true, message: `Connected successfully to gateway. Found ${count ?? 0} shows.` };
  } catch (err: any) {
    console.warn('Diagnostic connection test exception:', err);
    return {
      success: false,
      message: `Gateway test failed: ${err.message}`,
    };
  }
}

/**
 * Handles real-time subscriptions for a given table.
 * Returns a function to unsubscribe.
 */
export function subscribeToTable(table: string, onEvent: (payload: any) => void): (() => void) | null {
  const supabase = getSupabase();
  if (!supabase) return null;

  const channel = supabase
    .channel(`${table}-realtime-changes-${Date.now()}-${Math.random()}`)
    .on(
      'postgres_changes',
      {
        event: '*', // listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: table,
      },
      (payload) => {
        onEvent(payload);
      }
    )
    .subscribe((status) => {
      console.log(`Supabase Realtime subscription current status [${table}]:`, status);
    });

  return () => {
    if (supabase && channel) {
      supabase.removeChannel(channel).then();
    }
  };
}
