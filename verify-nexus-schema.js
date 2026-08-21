import { createClient } from '@supabase/supabase-js';

// Initialize the Nexus Core Secure Gateway Client via environment keys
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("✗ SYSTEM FAILURE: MISSING SUPABASE ENVIRONMENT VARIABLES.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// The Definitive Structural Dictionary Extracted from your Front-End Sweep
const NEXUS_BLUEPRINT = {
  bands: ['id', 'created_at', 'name', 'genre', 'homebase', 'logo_url'],
  profiles: ['id', 'created_at', 'full_name', 'email', 'role', 'avatar_url', 'band_id'],
  shows: [
    'id', 'created_at', 'name', 'festival_name', 'date', 'status', 'revenue', 
    'show_type', 'band_id', 'event_scope', 'tour_id', 'venue_address', 'city', 
    'state_province', 'country', 'promoter_contact', 'load_in_time', 'doors_time', 
    'set_time', 'curfew_time', 'venue_cut_percentage', 'guarantee_amount', 
    'currency', 'tax_rate', 'expected_attendance', 'additional_notes', 
    'merch_space_fee', 'seller_cost', 'tables_provided', 'hanging_grids_provided', 
    'shore_power', 'parking_arrangements', 'age_restriction', 'wifi_network', 
    'wifi_password', 'merch_call_time', 'soundcheck_time', 'dinner_arrangements', 
    'local_food_notes', 'emergency_medical_info', 'local_pharmacy_info', 'support_lineup'
  ],
  sales: ['id', 'created_at', 'item_name', 'quantity', 'item_type', 'amount', 'payment_method', 'customer_email', 'show_id', 'image_url', 'band_id', 'cart_items'],
  notes: ['id', 'created_at', 'category', 'text', 'tag_name', 'show_id', 'band_id'],
  inventory: ['id', 'created_at', 'name', 'table_stock', 'van_stock', 'low_threshold', 'initial_batch_size', 'status', 'item_type', 'price', 'image_url', 'border_color', 'is_exclusive', 'band_id', 'cost', 'sku', 'barcode', 'variants'],
  inventory_audits: ['id', 'created_at', 'item_id', 'item_name', 'quantity_change', 'reason', 'notes', 'band_id'],
  flights: ['id', 'created_at', 'traveler_name', 'airline', 'flight_number', 'departure_airport', 'arrival_airport', 'departure_time', 'arrival_time', 'status', 'gate', 'notes', 'band_id'],
  user_reviews: ['id', 'created_at', 'rating', 'text', 'name', 'group'],
  repertoire_songs: ['id', 'created_at', 'name', 'minutes', 'seconds', 'band_id'],
  setlists: ['show_id', 'created_at', 'allotted_minutes', 'allotted_seconds', 'songs'],
  guestlists: ['id', 'created_at', 'show_id', 'name', 'additional_count', 'access_type', 'email', 'phone', 'confirmed_sent', 'confirmed_sent_at', 'confirmed_sent_via'],
  loyalty_members: ['id', 'created_at', 'name', 'city', 'state', 'country', 'email', 'phone', 'pin', 'opt_in_promotions', 'lifetime_discount_uses'],
  show_settlements_v1: ['show_id', 'created_at', 'gross_merch_sales', 'venue_cut_apparel_pct', 'venue_cut_media_pct', 'show_guarantee', 'variance_penalty_total', 'net_venue_cut', 'band_net_payout', 'artist_signature', 'venue_signature', 'status'],
  show_audit_snapshots_v1: ['id', 'show_id', 'created_at', 'snapshot_data'],
  // Component-driven supplementary tables flagged for cloud verification
  routing_beacons_v1: ['id', 'band_name', 'target_region', 'start_date', 'end_date', 'booking_email', 'created_at'],
  community_printers_v1: ['id', 'name', 'company_name', 'email', 'phone', 'notes', 'rating', 'price_range', 'region', 'specialties', 'likes', 'reviews', 'blacklisted', 'blacklist_reason'],
  profiles_v2: ['id', 'account_type', 'creative_metadata', 'updated_at'],
  tour_flights_v1: ['flight_number', 'traveler_name', 'departure_date', 'departure_terminal', 'departure_gate', 'arrival_terminal', 'arrival_gate', 'estimated_arrival_time', 'status', 'airline', 'sync_timestamp'],
  creatives_v1: ['id', 'name', 'category', 'title_block', 'location', 'rate_range', 'bio'],
  creative_contracts_v1: ['id', 'created_at', 'project_title', 'creative_id', 'creative_name', 'creative_category', 'band_name', 'fee', 'timeline_days', 'enforced_protocols', 'verified_protocols', 'status'],
  notifications_v1: ['id', 'created_at', 'user_id', 'message', 'category', 'requires_push', 'is_read', 'item_id']
};

async function executeGlobalIntegritySweep() {
  console.log('================================================================================');
  console.log(' [!] RUNNING INITIAL NEXUS CORE SYSTEM SCHEMA INTEGRITY SWEEP...                ');
  console.log('================================================================================\n');

  try {
    // Phase 1: Test API Gateway Connection Health
    const { error: pingError } = await supabase.from('bands').select('id').limit(1);
    if (pingError) {
      throw new Error(`CRITICAL LOGISTICAL GAP: Remote Supabase connection refused. ${pingError.message}`);
    }
    console.log('✓ STATUS: GATEWAY CONNECTION TO SECURE INSTANCE VERIFIED.\n');

    // Phase 2: Interrogate remote system metadata via RPC to inspect live architecture
    console.log('[EXECUTING DATABASE BLUEPRINT INTEGRITY SCAN]');
    
    for (const [tableName, expectedColumns] of Object.entries(NEXUS_BLUEPRINT)) {
      // Query individual table maps dynamically via postgrest meta-pings
      const { data: columnData, error: tableError } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);

      if (tableError) {
        // Look explicitly for code PGRST204 (Missing Relation)
        if (tableError.code === 'PGRST204' || tableError.message.includes('does not exist')) {
          console.error(` ✗ TABLE CRITICAL EXPOSURE: "${tableName}" IS COMPLETELY ABSENT FROM PRODUCTION INSTANCE.`);
        } else {
          console.error(` ✗ TABLE ACCESS ERROR: "${tableName}" returned code ${tableError.code}: ${tableError.message}`);
        }
        continue;
      }

      // If table exists, execute deep array verification via an alternative explicit column fetch or metadata match
      // Note: Because a limit(0) array doesn't return column headers directly on empty sets, we pull an RPC map 
      // or check keys if data exists. To safely query the information_schema via standard client:
      const { data: schemaMetadata, error: schemaError } = await supabase
        .rpc('inspect_table_columns', { target_table: tableName });

      if (schemaError) {
        // Fallback trace warning if custom RPC is not yet provisioned on your database dashboard
        console.log(` ⚠ TABLE "${tableName}" IS LIVE. (Pro-tip: deploy database helper RPC to scan individual columns automatically).`);
        continue;
      }

      const activeColumns = schemaMetadata.map(row => row.column_name);
      
      expectedColumns.forEach(col => {
        if (!activeColumns.includes(col)) {
          console.error(`   ✗ COLUMN MISMATCH: Table "${tableName}" lacks required field "${col}"`);
        }
      });
    }

  } catch (error) {
    console.error(`\n!!! CRITICAL SECURITY TERMINATION: ${error.message}`);
  }
  
  console.log('\n================================================================================');
  console.log(' [!] SCHEMA SWEEP COMPLETED. REPAIR DETECTED OUT-OF-SYNC NODES.                 ');
  console.log('================================================================================');
}

executeGlobalIntegritySweep();