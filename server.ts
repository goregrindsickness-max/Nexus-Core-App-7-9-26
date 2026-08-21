import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import fs from "fs";

// Load environment variables (mostly for local testing, platform handles deployment env vars)
dotenv.config();

/**
 * SUPABASE SERVICE ROLE CONFIGURATION & SECURE VAULT ACCESS
 */
let supabaseServiceClient: any = null;
function getSupabaseService() {
  if (!supabaseServiceClient) {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (url && serviceRoleKey) {
      supabaseServiceClient = createClient(url, serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      });
    }
  }
  return supabaseServiceClient;
}

/**
 * Local fallback mapping for pricing tokens if they are not yet provisioned in the Supabase Vault
 */
const VAULT_LOCAL_FALLBACKS: Record<string, string> = {
  PRICE_ID_BAND_PERSHOW: "price_band_pershow",
  PRICE_ID_BAND_PERTOUR: "price_band_pertour",
  PRICE_ID_BAND_PRO_MONTHLY: "price_band_touring_pro_mo",
  PRICE_ID_BAND_PRO_YEARLY: "price_band_touring_pro_yr",
  PRICE_ID_BAND_PLUS_MONTHLY: "price_band_touring_pro_plus_mo",
  PRICE_ID_BAND_PLUS_YEARLY: "price_band_touring_pro_plus_yr",
  PRICE_ID_PROMOTER_POWER_MONTHLY: "price_promoter_power_mo",
  PRICE_ID_PROMOTER_ENTERPRISE_MONTHLY: "price_promoter_enterprise_mo",
  STRIPE_WEBHOOK_SECRET: "whsec_uyZYuw7jKehg5UYeXrwaIkqO1DdA3zzx"
};

/**
 * Retreive decrypted values from Supabase Vault utilizing get_decrypted_secret RPC
 */
async function getVaultSecret(secretName: string): Promise<string | null> {
  const upperName = secretName.toUpperCase();
  const lowerName = secretName.toLowerCase();

  // 1. Fast Path: Look up directly from direct Node environment configuration if defined
  if (process.env[upperName]) {
    console.log(`[VAULT LOCAL] Recovered key "${upperName}" directly from process environment variables.`);
    return process.env[upperName];
  }
  if (process.env[lowerName]) {
    console.log(`[VAULT LOCAL] Recovered key "${lowerName}" directly from process environment variables.`);
    return process.env[lowerName];
  }

  const supabase = getSupabaseService();
  if (!supabase) {
    console.log(`[VAULT WARN] Supabase service client not active. Looking up local fallback key for: "${secretName}".`);
    return VAULT_LOCAL_FALLBACKS[upperName] || VAULT_LOCAL_FALLBACKS[lowerName] || null;
  }

  try {
    console.log(`[VAULT CALL] Querying RPC get_decrypted_secret for vault key: "${upperName}"`);
    let { data, error } = await supabase.rpc("get_decrypted_secret", {
      secret_name: upperName
    });

    if (!error && data) {
      if (data.length > 0 && data[0].decrypted_secret) {
        return data[0].decrypted_secret;
      }
      if (typeof data === "string" && data.trim().length > 0) {
        return data;
      }
      if (typeof data === "object") {
        const resolved = data.decrypted_secret || data.secret;
        if (resolved) return resolved;
      }
    }

    console.log(`[VAULT CALL] Querying RPC get_decrypted_secret for vault key: "${lowerName}"`);
    const result = await supabase.rpc("get_decrypted_secret", {
      secret_name: lowerName
    });
    data = result.data;
    error = result.error;

    if (!error && data) {
      if (data.length > 0 && data[0].decrypted_secret) {
        return data[0].decrypted_secret;
      }
      if (typeof data === "string" && data.trim().length > 0) {
        return data;
      }
      if (typeof data === "object") {
        const resolved = data.decrypted_secret || data.secret;
        if (resolved) return resolved;
      }
    }

    console.log(`[VAULT RECOVERY] RPC get_decrypted_secret is not present or restricted. Utilizing local config fallback for "${secretName}".`);
    return VAULT_LOCAL_FALLBACKS[upperName] || VAULT_LOCAL_FALLBACKS[lowerName] || null;
  } catch (err: any) {
    console.log(`[VAULT INFO] Lookup for vault key "${secretName}" deferred to local configuration. Reason:`, err.message || err);
    return VAULT_LOCAL_FALLBACKS[upperName] || VAULT_LOCAL_FALLBACKS[lowerName] || null;
  }
}

/**
 * STRIPE SETUP
 * Requires STRIPE_SECRET_KEY in environment to function fully.
 */
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!stripeClient && process.env.STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-05-27.dahlia' as any,
    });
  }
  return stripeClient;
}

async function getStripeAsync(): Promise<Stripe | null> {
  if (stripeClient) return stripeClient;
  const secretKey = await getVaultSecret("STRIPE_SECRET_KEY");
  if (secretKey) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2026-05-27.dahlia' as any,
    });
  }
  return stripeClient;
}

/**
 * RESEND SETUP
 */
let resendClient: Resend | null = null;
function getResend(): Resend | null {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

// In-memory email dispatch logs
interface EmailLogEntry {
  id: string;
  timestamp: string;
  endpoint: string;
  to: string;
  from: string;
  subject: string;
  status: 'SUCCESS' | 'FAILED' | 'SIMULATED';
  details?: any;
}
const emailLogs: EmailLogEntry[] = [];

function recordEmailLog(endpoint: string, to: string, from: string, subject: string, status: 'SUCCESS' | 'FAILED' | 'SIMULATED', details?: any) {
  const entry: EmailLogEntry = {
    id: 'elog_' + Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    endpoint,
    to,
    from,
    subject,
    status,
    details
  };
  emailLogs.unshift(entry);
  if (emailLogs.length > 50) {
    emailLogs.pop();
  }
}

/**
 * Bulletproof, high-contrast, responsive HTML email wrapper styled after the Nexus Core splash page
 */
function getNexusEmailWrapper(contentHtml: string, previewText: string = "Nexus Core Dispatch", appUrl: string = "https://thenexuscoreapp.com") {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nexus Core</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0c0e12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #e4e4e7;">
        <div style="display: none; max-height: 0px; overflow: hidden; opacity: 0; font-size: 1px; color: transparent; line-height: 1px;">
          ${previewText}
        </div>
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0c0e12; min-width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 24px 16px 48px 16px;">
              <!-- Main Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #12151e; border: 1px solid #1f2736; border-radius: 12px; overflow: hidden; border-collapse: collapse; box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);">
                
                <!-- Splash / Concert Vibe Header with Concert Background Image -->
                <tr>
                  <td align="center" style="background-color: #080a0f; padding: 44px 24px 40px 24px; border-bottom: 2px solid #1f2736; background-image: linear-gradient(135deg, rgba(14, 17, 26, 0.88) 0%, rgba(6, 8, 13, 0.95) 100%), url('${appUrl}/%E2%80%94Pngtree%E2%80%94high%20energy%20live%20music%20concert_19830850.png'); background-size: cover; background-position: center; background-repeat: no-repeat;">
                    <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                      <tr>
                        <td align="center">
                          <!-- Official logo image -->
                          <div style="margin-bottom: 12px;">
                            <img src="${appUrl}/Nexus%20Core%20Long%20Logo%20copy.png" alt="[NEXUS_CORE]" height="60" style="display: block; border: 0; outline: none; margin: 0 auto; max-width: 100%; height: 60px;" />
                          </div>
                          <!-- Subtext / Live ops -->
                          <div style="font-size: 9px; font-weight: 850; letter-spacing: 3.5px; color: #00ffcc; text-transform: uppercase; margin-top: 10px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; opacity: 0.95;">
                            LIVE MUSIC OPS NETWORK
                          </div>
                          <!-- Double Accent Pulse bar -->
                          <div style="height: 1px; width: 60px; background: linear-gradient(90deg, #00ffcc 0%, #a855f7 100%); margin-top: 14px; border-radius: 1px;"></div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content Area -->
                <tr>
                  <td style="padding: 44px 36px 36px 36px; background-color: #12151e; font-size: 14px; line-height: 1.6; color: #d4d4d8;">
                    ${contentHtml}
                  </td>
                </tr>

                <!-- Footer (Official Theme) -->
                <tr>
                  <td align="center" style="padding: 36px 24px; background-color: #080a0f; border-top: 1px solid #1f2736; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="text-align: center; border-collapse: collapse;">
                      <tr>
                        <td style="color: #71717a; font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6;">
                          <p style="margin: 0 0 8px 0; color: #a1a1aa; font-weight: 800; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; font-family: 'SFMono-Regular', Consolas, monospace;">// SECURE TRANS-GATE DISPATCH</p>
                          <p style="margin: 0 0 6px 0;">This transmission was authorized & signed by Nexus Core Gateway.</p>
                          <p style="margin: 0 0 24px 0;">Live Tour Management &middot; Roster Verification &middot; Fan Hub</p>
                          
                          <!-- Accent Indicator -->
                          <div style="height: 3px; width: 40px; background: linear-gradient(90deg, #00ffcc, #a855f7); margin: 0 auto 18px auto; border-radius: 1px;"></div>
                          
                          <p style="margin: 0; font-size: 10px; color: #52525b;">&copy; 2026 Nexus Core App. All routing beacons and artist schedules are protected end-to-end.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Stripe webhook needs raw body parser, so place it BEFORE express.json()
  app.post("/api/webhooks/stripe", express.raw({ type: 'application/json' }), async (req: express.Request, res: express.Response) => {
    const signature = req.headers["stripe-signature"];
    const stripe = await getStripeAsync();
    if (!stripe) {
      console.warn("[WEBHOOK ERROR] Stripe is not configured.");
      return res.status(500).json({ error: "Stripe not configured" });
    }

    let event;
    try {
      const webhookSecret = await getVaultSecret("STRIPE_WEBHOOK_SECRET") || process.env.STRIPE_WEBHOOK_SECRET;
      if (webhookSecret && signature) {
        event = stripe.webhooks.constructEvent(req.body, signature as string, webhookSecret);
      } else {
        // Fallback or unverified handling for testing/debugging
        event = JSON.parse(req.body.toString());
      }
    } catch (err: any) {
      console.error(`[WEBHOOK ERROR] Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`[STRIPE WEBHOOK] Received event of type: ${event.type}`);

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        console.log(`[STRIPE WEBHOOK] Checkout completed for session: ${session.id}`, session);
        
        const email = session.customer_email || (session.metadata && session.metadata.email);
        const tier = session.metadata && session.metadata.tierId;
        const cycle = session.metadata && session.metadata.billingCycle;
        
        console.log(`[STRIPE WEBHOOK SUCCESS] Handled subscription checkout completed for ${email} -> ${tier} (${cycle})`);
        
        // If supabase is available, we can sync the database profile status!
        const supabase = getSupabaseService();
        if (supabase && email) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('email', email).maybeSingle();
          if (profile) {
            await supabase.from('profiles').update({
              sub_tier: tier,
              subscription_status: 'active',
              stripe_customer_id: session.customer || profile.stripe_customer_id
            }).eq('id', profile.id);
            console.log(`[STRIPE WEBHOOK DB SYNC] Successfully updated profile ${profile.id} with tier: ${tier}`);
          }
        }
      }
      
      res.json({ received: true });
    } catch (err: any) {
      console.error(`[WEBHOOK ERROR] Error handling event ${event.type}:`, err);
      res.status(500).json({ error: err.message });
    }
  });

  // We need JSON parsing for our API routes (with larger size limit to allow base64 uploads)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Ensure and serve local uploads directory for robust file persistence
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Persistent storage for avatar comments and reactions
  const avatarInteractionsFile = path.join(uploadsDir, 'avatar_interactions.json');
  let avatarInteractions: Record<string, any> = {};

  try {
    if (fs.existsSync(avatarInteractionsFile)) {
      const fileContent = fs.readFileSync(avatarInteractionsFile, 'utf8');
      avatarInteractions = JSON.parse(fileContent);
    }
  } catch (e) {
    console.error("Failed to load avatar interactions:", e);
  }

  const saveAvatarInteractions = async () => {
    try {
      await fs.promises.writeFile(avatarInteractionsFile, JSON.stringify(avatarInteractions, null, 2), 'utf8');
    } catch (e) {
      console.error("Failed to save avatar interactions:", e);
    }
  };

  // API ROUTES: Avatar Reactions & Comments
  app.get("/api/avatar-interactions/:profileId", (req, res) => {
    const { profileId } = req.params;
    const data = avatarInteractions[profileId] || { reactions: [], comments: [] };
    res.json(data);
  });

  app.post("/api/avatar-interactions/:profileId/react", async (req, res) => {
    const { profileId } = req.params;
    const { userId, username, avatarUrl, emoji } = req.body;

    if (!userId || !emoji) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!avatarInteractions[profileId]) {
      avatarInteractions[profileId] = { reactions: [], comments: [] };
    }

    const interactions = avatarInteractions[profileId];
    const existingIndex = interactions.reactions.findIndex(
      (r: any) => r.userId === userId && r.emoji === emoji
    );

    if (existingIndex > -1) {
      interactions.reactions.splice(existingIndex, 1);
    } else {
      interactions.reactions.push({ userId, username, avatarUrl, emoji });
    }

    await saveAvatarInteractions();
    res.json(interactions);
  });

  app.post("/api/avatar-interactions/:profileId/comment", async (req, res) => {
    const { profileId } = req.params;
    const { userId, username, avatarUrl, text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!avatarInteractions[profileId]) {
      avatarInteractions[profileId] = { reactions: [], comments: [] };
    }

    const interactions = avatarInteractions[profileId];
    const newComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId,
      username,
      avatarUrl,
      text,
      createdAt: new Date().toISOString()
    };

    interactions.comments.push(newComment);
    await saveAvatarInteractions();
    res.json(interactions);
  });

  // API ROUTE: Upload file to local uploads directory (bypasses Supabase Storage RLS policies)
  app.post("/api/upload", async (req, res) => {
    try {
      const { base64Data, bucket, userId, fileNameToken } = req.body;
      if (!base64Data) {
        return res.status(400).json({ error: "Missing base64Data" });
      }

      // Extract raw base64 data and extension
      const matches = base64Data.match(/^data:([^;]+);base64,([\s\S]+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Invalid base64 data format" });
      }

      const contentType = matches[1];
      const base64Image = matches[2].replace(/\s+/g, '');
      const buffer = Buffer.from(base64Image, 'base64');
      
      const fileExt = contentType.split('/')[1] || 'webp';
      const cleanFileNameToken = (fileNameToken || 'image').replace(/[^a-zA-Z0-9-_]/g, '_');
      const uniqueName = `${userId || 'anonymous'}_${bucket || 'assets'}_${cleanFileNameToken}_${Date.now()}.${fileExt}`;
      
      // Try uploading to Supabase Storage first to bypass RLS policies and store persistently
      const supabase = getSupabaseService();
      if (supabase && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const bucketName = bucket || 'avatars';
        try {
          // List existing buckets to verify/create
          const { data: buckets, error: listError } = await supabase.storage.listBuckets();
          if (!listError && buckets) {
            const bucketExists = buckets.some((b: any) => b.name === bucketName);
            if (!bucketExists) {
              console.info(`[SERVER UPLOAD] Creating public bucket: ${bucketName}`);
              await supabase.storage.createBucket(bucketName, {
                public: true,
                fileSizeLimit: 10485760, // 10MB
              });
            }
          }
          
          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(uniqueName, buffer, {
              contentType: contentType,
              upsert: true,
            });

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from(bucketName)
              .getPublicUrl(uniqueName);

            if (publicUrlData?.publicUrl) {
              console.info(`[SERVER UPLOAD SUCCESS] Uploaded ${bucketName}/${uniqueName} to Supabase Storage: ${publicUrlData.publicUrl}`);
              return res.json({ publicUrl: `${publicUrlData.publicUrl}?t=${Date.now()}` });
            }
          } else {
            console.warn("[SERVER UPLOAD WARNING] Supabase Storage upload failed, falling back to local file...", uploadError);
          }
        } catch (storageErr) {
          console.warn("[SERVER UPLOAD EXCEPTION] Supabase Storage upload exception, falling back to local file...", storageErr);
        }
      }

      // Local filesystem fallback
      const filePath = path.join(uploadsDir, uniqueName);
      await fs.promises.writeFile(filePath, buffer);
      
      const publicUrl = `/uploads/${uniqueName}`;
      console.info(`[SERVER UPLOAD FALLBACK SUCCESS] Saved ${bucket || 'assets'}/${cleanFileNameToken} locally to ${publicUrl}`);
      res.json({ publicUrl });
    } catch (err: any) {
      console.error("[SERVER UPLOAD ERROR]", err);
      res.status(500).json({ error: err.message || "Failed to save file" });
    }
  });

  // API ROUTE: Health check
  app.get("/api/health", async (req, res) => {
    res.json({ status: "ok", stripe_enabled: !!(await getStripeAsync()), resend_enabled: !!getResend() });
  });

  // Global in-memory & file-based storage bucket for playlists to accumulate and persist metadata globally
  interface PlaylistTrack {
    videoId: string;
    title: string;
    author: string;
    thumbnailUrl: string;
  }
  const playlistMemoryCache = new Map<string, PlaylistTrack[]>();
  const GLOBAL_PLAYLIST_STORAGE_FILE = path.join(process.cwd(), "data", "scene_radio_global_playlists.json");

  function readGlobalPlaylistFile(): Record<string, PlaylistTrack[]> {
    try {
      if (fs.existsSync(GLOBAL_PLAYLIST_STORAGE_FILE)) {
        const content = fs.readFileSync(GLOBAL_PLAYLIST_STORAGE_FILE, "utf-8");
        return JSON.parse(content) || {};
      }
    } catch (e) {
      console.warn("[SERVER RADIO] Could not read global playlist file:", e);
    }
    return {};
  }

  function writeGlobalPlaylistFile(dataMap: Record<string, PlaylistTrack[]>) {
    try {
      const parentDir = path.dirname(GLOBAL_PLAYLIST_STORAGE_FILE);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(GLOBAL_PLAYLIST_STORAGE_FILE, JSON.stringify(dataMap, null, 2), "utf-8");
    } catch (e) {
      console.warn("[SERVER RADIO] Could not write global playlist file:", e);
    }
  }

  async function getPlaylistCache(playlistId: string): Promise<PlaylistTrack[]> {
    // 1. Check in-memory cache
    if (playlistMemoryCache.has(playlistId)) {
      return playlistMemoryCache.get(playlistId) || [];
    }

    // 2. Check local file storage bucket
    const fileData = readGlobalPlaylistFile();
    if (fileData[playlistId] && Array.isArray(fileData[playlistId]) && fileData[playlistId].length > 0) {
      console.info(`[SERVER RADIO] Loaded ${fileData[playlistId].length} tracks for playlist ${playlistId} from global file storage bucket.`);
      playlistMemoryCache.set(playlistId, fileData[playlistId]);
      return fileData[playlistId];
    }

    // 3. Check database (Supabase)
    const supabase = getSupabaseService();
    if (supabase) {
      try {
        const dbKey = `playlist_cache_${playlistId}`;
        const { data } = await supabase
          .from("nexus_notifications")
          .select("data")
          .eq("id", dbKey)
          .maybeSingle();

        if (data && Array.isArray(data.data) && data.data.length > 0) {
          console.info(`[SERVER RADIO] Recovered ${data.data.length} tracks for playlist ${playlistId} from database.`);
          playlistMemoryCache.set(playlistId, data.data);
          fileData[playlistId] = data.data;
          writeGlobalPlaylistFile(fileData);
          return data.data;
        }
      } catch (err: any) {
        console.warn(`[SERVER RADIO WARNING] Failed to read playlist cache from DB:`, err.message);
      }
    }

    return [];
  }

  async function savePlaylistCache(playlistId: string, tracks: PlaylistTrack[]): Promise<void> {
    // Update in-memory cache
    playlistMemoryCache.set(playlistId, tracks);

    // Update global persistent file storage bucket
    const fileData = readGlobalPlaylistFile();
    fileData[playlistId] = tracks;
    writeGlobalPlaylistFile(fileData);

    // Persist to database (Supabase)
    const supabase = getSupabaseService();
    if (supabase) {
      try {
        const dbKey = `playlist_cache_${playlistId}`;
        await supabase
          .from("nexus_notifications")
          .upsert({
            id: dbKey,
            data: tracks,
            created_at: new Date().toISOString()
          });
        console.info(`[SERVER RADIO] Successfully persisted ${tracks.length} tracks for playlist ${playlistId} to global storage bucket & database.`);
      } catch (err: any) {
        console.warn(`[SERVER RADIO WARNING] Failed to persist playlist cache to DB:`, err.message);
      }
    }
  }

  // API ROUTE: Fetch and parse YouTube playlist RSS feed without requiring API keys
  app.get("/api/playlist/:playlistId", async (req, res) => {
    try {
      const { playlistId } = req.params;
      if (!playlistId || typeof playlistId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(playlistId)) {
        return res.status(400).json({ error: "Invalid playlist ID" });
      }

      console.info(`[SERVER RADIO] Fetching playlist feed: ${playlistId}`);
      
      // Load existing cache (from memory, falling back to Supabase)
      const existingTracks = await getPlaylistCache(playlistId);

      // Fetch latest from YouTube RSS feed (max 15 tracks)
      let xml = "";
      let fetchSuccess = false;
      try {
        const response = await fetch(`https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        });
        if (response.ok) {
          xml = await response.text();
          fetchSuccess = true;
        } else {
          // Suppress 500 and 404 warnings since we have a hardcoded fallback mechanism
          if (response.status !== 500 && response.status !== 404) {
            console.warn(`[SERVER RADIO INFO] Using fallback feed for playlist ${playlistId}.`);
          }
        }
      } catch (fetchErr: any) {
        // Suppress fetch errors as we have a hardcoded fallback
      }

      const freshTracks: PlaylistTrack[] = [];

      if (fetchSuccess && xml) {
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
        let match;

        while ((match = entryRegex.exec(xml)) !== null) {
          const entryContent = match[1];
          
          const videoIdMatch = entryContent.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) || entryContent.match(/<id>yt:video:([^<]+)<\/id>/);
          const titleMatch = entryContent.match(/<title>([^<]+)<\/title>/);
          const authorMatch = entryContent.match(/<author>\s*<name>([^<]+)<\/name>/);
          const thumbMatch = entryContent.match(/<media:thumbnail[^>]+url="([^"]+)"/) || entryContent.match(/url="([^"]+)"[^>]*media:thumbnail/);

          const videoId = videoIdMatch ? videoIdMatch[1].trim() : "";
          let title = titleMatch ? titleMatch[1].trim() : "Unknown Track";
          const author = authorMatch ? authorMatch[1].trim() : "Unknown Artist";
          const thumbnailUrl = thumbMatch ? thumbMatch[1].trim() : (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "");

          // Decode basic XML entities
          title = title
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'");

          if (videoId) {
            freshTracks.push({ videoId, title, author, thumbnailUrl });
          }
        }
      }

      // Merge fresh tracks with existing cached tracks (deduplicating by videoId)
      // Fresh/newly fetched items go first to keep the queue hot, rest of historical cache follows.
      const mergedMap = new Map<string, PlaylistTrack>();
      
      // 1. Add fresh tracks
      for (const track of freshTracks) {
        mergedMap.set(track.videoId, track);
      }

      // 2. Add existing cached tracks (only if they aren't already there)
      for (const track of existingTracks) {
        if (!mergedMap.has(track.videoId)) {
          mergedMap.set(track.videoId, track);
        }
      }

      let mergedList = Array.from(mergedMap.values());

      // 3. Fallback check: if we have zero tracks (neither RSS feed fetched any nor did we have database/memory cached entries)
      if (mergedList.length === 0) {
        console.info(`[SERVER RADIO] No cached tracks or fresh RSS found. Seeding with default fallback catalog.`);
        const FALLBACK_PLAYLISTS: Record<string, PlaylistTrack[]> = {
          'PLchMzReuuu_8PieB87bPG3rTxWogLuoMB': [ // Brutal Death
            { videoId: '0g863f6H0lE', title: 'Inhumane Harvest', author: 'Cannibal Corpse', thumbnailUrl: 'https://img.youtube.com/vi/0g863f6H0lE/hqdefault.jpg' },
            { videoId: 'gPn6LpA8Z0A', title: 'Seraphim Enslavement', author: 'Suffocation', thumbnailUrl: 'https://img.youtube.com/vi/gPn6LpA8Z0A/hqdefault.jpg' },
            { videoId: 'sFst6n2m6W8', title: 'Compulsion for Cruelty', author: 'Dying Fetus', thumbnailUrl: 'https://img.youtube.com/vi/sFst6n2m6W8/hqdefault.jpg' },
            { videoId: '6qG8NIn761w', title: 'Cognitive Evisceration', author: 'Devourment', thumbnailUrl: 'https://img.youtube.com/vi/6qG8NIn761w/hqdefault.jpg' }
          ],
          'PLchMzReuuu_-fffjCRQpc5Mo50-QYzNMI': [ // Classic Death
            { videoId: 'sE08V8U3oH0', title: 'Lack of Comprehension', author: 'Death', thumbnailUrl: 'https://img.youtube.com/vi/sE08V8U3oH0/hqdefault.jpg' },
            { videoId: '6X3ZOf3L61c', title: 'Rapture', author: 'Morbid Angel', thumbnailUrl: 'https://img.youtube.com/vi/6X3ZOf3L61c/hqdefault.jpg' },
            { videoId: '4qgN-6_K2w8', title: 'Slowly We Rot', author: 'Obituary', thumbnailUrl: 'https://img.youtube.com/vi/4qgN-6_K2w8/hqdefault.jpg' },
            { videoId: 'fB37S_o0Bxs', title: 'Left Hand Path', author: 'Entombed', thumbnailUrl: 'https://img.youtube.com/vi/fB37S_o0Bxs/hqdefault.jpg' }
          ],
          'PLBWvM6w9IQeR1uy-3_eIf2g8fHFccXWzZ': [ // Tech Death
            { videoId: 's7oZ4xV_f_k', title: 'Drone Corpse Aviator', author: 'Archspire', thumbnailUrl: 'https://img.youtube.com/vi/s7oZ4xV_f_k/hqdefault.jpg' },
            { videoId: 'e_K6_q_K80o', title: 'Stabwound', author: 'Necrophagist', thumbnailUrl: 'https://img.youtube.com/vi/e_K6_q_K80o/hqdefault.jpg' },
            { videoId: 'v8-S1pW_Fk8', title: 'Septuagint', author: 'Obscura', thumbnailUrl: 'https://img.youtube.com/vi/v8-S1pW_Fk8/hqdefault.jpg' },
            { videoId: 'tK8f7sP_m8E', title: 'Omnipresent Perception', author: 'Beyond Creation', thumbnailUrl: 'https://img.youtube.com/vi/tK8f7sP_m8E/hqdefault.jpg' }
          ],
          'PLchMzReuuu_9bhcmdqiiwZjzR4TL0Lt1r': [ // Goregrind
            { videoId: 'b7f0Y8k_p0U', title: 'Genital Grinder', author: 'Carcass', thumbnailUrl: 'https://img.youtube.com/vi/b7f0Y8k_p0U/hqdefault.jpg' },
            { videoId: '8p_FkS9F0l8', title: 'A Divine Proclamation of Degeneration', author: 'Last Days of Humanity', thumbnailUrl: 'https://img.youtube.com/vi/8p_FkS9F0l8/hqdefault.jpg' },
            { videoId: 't8f_Z8f_k8U', title: 'Bleeding Heap of Flesh', author: 'Regurgitate', thumbnailUrl: 'https://img.youtube.com/vi/t8f_Z8f_k8U/hqdefault.jpg' }
          ],
          'PLchMzReuuu__jJpKhyYVGfavwrgHBdtK2': [ // Grindcore
            { videoId: 'K7oZ7f_N7k0', title: 'You Suffer', author: 'Napalm Death', thumbnailUrl: 'https://img.youtube.com/vi/K7oZ7f_N7k0/hqdefault.jpg' },
            { videoId: '8t8P_Y7l0U8', title: 'Piss Angel', author: 'Pig Destroyer', thumbnailUrl: 'https://img.youtube.com/vi/8t8P_Y7l0U8/hqdefault.jpg' },
            { videoId: 't7P_Z7f_X80', title: 'Wrath', author: 'Nasum', thumbnailUrl: 'https://img.youtube.com/vi/t7P_Z7f_X80/hqdefault.jpg' },
            { videoId: 'v8FkP_Y7lE0', title: 'Dead Shall Rise', author: 'Terrorizer', thumbnailUrl: 'https://img.youtube.com/vi/v8FkP_Y7lE0/hqdefault.jpg' }
          ],
          'PLchMzReuuu_8av4RYcuW8rptIqmr0kSHS': [ // Blackened Death
            { videoId: '8f7kP_Y7l0U', title: 'Blow Your Trumpets Gabriel', author: 'Behemoth', thumbnailUrl: 'https://img.youtube.com/vi/8f7kP_Y7l0U/hqdefault.jpg' },
            { videoId: 'f7kP_Z7l_E0', title: 'Virtus Asinaria', author: 'Belphegor', thumbnailUrl: 'https://img.youtube.com/vi/f7kP_Z7l_E0/hqdefault.jpg' },
            { videoId: 'v7kP_Y7l_k8', title: 'Sovereign Sanctity', author: 'Hate', thumbnailUrl: 'https://img.youtube.com/vi/v7kP_Y7l_k8/hqdefault.jpg' }
          ],
          'PLchMzReuuu_8tMyh0UKsCasYz6BlbKGmW': [ // Black Metal
            { videoId: '8f_P_Y7l0U8', title: 'Freezing Moon', author: 'Mayhem', thumbnailUrl: 'https://img.youtube.com/vi/8f_P_Y7l0U8/hqdefault.jpg' },
            { videoId: 'f7_P_Z7l_E0', title: 'Transilvanian Hunger', author: 'Darkthrone', thumbnailUrl: 'https://img.youtube.com/vi/f7_P_Z7l_E0/hqdefault.jpg' },
            { videoId: 'v7_P_Y7l_k8', title: 'I Am the Black Wizards', author: 'Emperor', thumbnailUrl: 'https://img.youtube.com/vi/v7_P_Y7l_k8/hqdefault.jpg' }
          ],
          'PLchMzReuuu_8X8-o1wN3VkESLti7TLAMV': [ // Thrash Metal
            { videoId: '8f_P_Y7l0U9', title: 'Raining Blood', author: 'Slayer', thumbnailUrl: 'https://img.youtube.com/vi/8f_P_Y7l0U9/hqdefault.jpg' },
            { videoId: 'f7_P_Z7l_E9', title: 'Master of Puppets', author: 'Metallica', thumbnailUrl: 'https://img.youtube.com/vi/f7_P_Z7l_E9/hqdefault.jpg' },
            { videoId: 'v7_P_Y7l_k9', title: 'Holy Wars... The Punishment Due', author: 'Megadeth', thumbnailUrl: 'https://img.youtube.com/vi/v7_P_Y7l_k9/hqdefault.jpg' }
          ],
          'PLchMzReuuu_8FppUXuwggPW9e86Jn6vFu': [ // Lyric Videos
            { videoId: 's7oZ4xV_f_k', title: 'Drone Corpse Aviator (Lyric Video)', author: 'Archspire', thumbnailUrl: 'https://img.youtube.com/vi/s7oZ4xV_f_k/hqdefault.jpg' },
            { videoId: '0g863f6H0lE', title: 'Inhumane Harvest (Lyric Video)', author: 'Cannibal Corpse', thumbnailUrl: 'https://img.youtube.com/vi/0g863f6H0lE/hqdefault.jpg' }
          ]
        };

        mergedList = FALLBACK_PLAYLISTS[playlistId] || [
          { videoId: 's7oZ4xV_f_k', title: 'Metal Scene Radio Track 1', author: 'Metal Artist', thumbnailUrl: 'https://img.youtube.com/vi/s7oZ4xV_f_k/hqdefault.jpg' }
        ];
      }

      // 4. Save and persist the updated, aggregated list of tracks (allow up to 400 tracks to support large playlists)
      const finalMergedList = mergedList.slice(0, 400);

      // Background auto-enrichment for any un-named tracks using YouTube oEmbed
      const unNamedTracks = finalMergedList.filter(t => !t.title || t.title.startsWith("Track ") || t.author === "Unknown Artist").slice(0, 25);
      if (unNamedTracks.length > 0) {
        Promise.allSettled(unNamedTracks.map(async (track) => {
          try {
            const resp = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${track.videoId}&format=json`, {
              headers: { "User-Agent": "Mozilla/5.0" }
            });
            if (resp.ok) {
              const oData = await resp.json();
              if (oData.title) track.title = oData.title;
              if (oData.author_name) track.author = oData.author_name;
              if (oData.thumbnail_url) track.thumbnailUrl = oData.thumbnail_url;
            }
          } catch (e) {
            // ignore individual oembed error
          }
        })).then(() => {
          savePlaylistCache(playlistId, finalMergedList).catch(() => {});
        });
      }

      await savePlaylistCache(playlistId, finalMergedList);

      console.info(`[SERVER RADIO SUCCESS] Returning ${finalMergedList.length} aggregated/cached tracks for playlist: ${playlistId}`);
      res.json({ videos: finalMergedList });
    } catch (err: any) {
      console.error("[PLAYLIST ENDPOINT ERROR]", err);
      res.status(500).json({ error: err.message || "Failed to fetch playlist" });
    }
  });

  // API ROUTE: Save / update track metadata for a playlist
  app.post("/api/playlist/:playlistId/tracks", express.json(), async (req, res) => {
    try {
      const { playlistId } = req.params;
      const { tracks } = req.body; // Array of PlaylistTrack or single track object

      if (!playlistId || typeof playlistId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(playlistId)) {
        return res.status(400).json({ error: "Invalid playlist ID" });
      }

      const inputTracks: PlaylistTrack[] = Array.isArray(tracks) ? tracks : (req.body.videoId ? [req.body] : []);
      if (inputTracks.length === 0) {
        return res.status(400).json({ error: "No tracks provided" });
      }

      const existingTracks = await getPlaylistCache(playlistId);
      const trackMap = new Map<string, PlaylistTrack>();

      for (const t of existingTracks) {
        if (t.videoId) trackMap.set(t.videoId, t);
      }

      for (const t of inputTracks) {
        if (!t.videoId) continue;
        const current = trackMap.get(t.videoId);
        trackMap.set(t.videoId, {
          videoId: t.videoId,
          title: t.title && !t.title.startsWith("Track ") ? t.title : (current?.title || t.title || `Track`),
          author: t.author && t.author !== "Unknown Artist" ? t.author : (current?.author || t.author || "Unknown Artist"),
          thumbnailUrl: t.thumbnailUrl || current?.thumbnailUrl || `https://img.youtube.com/vi/${t.videoId}/hqdefault.jpg`
        });
      }

      const updatedList = Array.from(trackMap.values()).slice(0, 400);
      await savePlaylistCache(playlistId, updatedList);

      res.json({ success: true, count: updatedList.length, videos: updatedList });
    } catch (err: any) {
      console.error("[SAVE PLAYLIST TRACKS ERROR]", err);
      res.status(500).json({ error: err.message || "Failed to save track metadata" });
    }
  });

  // API ROUTE: Enrich playlist video IDs using YouTube oEmbed (No API Key required)
  app.post("/api/playlist/:playlistId/enrich", express.json(), async (req, res) => {
    try {
      const { playlistId } = req.params;
      const { videoIds } = req.body; // array of string video IDs from YouTube iframe API getPlaylist()

      if (!playlistId || typeof playlistId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(playlistId)) {
        return res.status(400).json({ error: "Invalid playlist ID" });
      }

      if (!Array.isArray(videoIds) || videoIds.length === 0) {
        return res.status(400).json({ error: "videoIds must be a non-empty array" });
      }

      const existingTracks = await getPlaylistCache(playlistId);
      const trackMap = new Map<string, PlaylistTrack>();
      for (const t of existingTracks) {
        if (t.videoId) trackMap.set(t.videoId, t);
      }

      // Filter video IDs that need oEmbed lookup (missing title or default "Track N" title)
      const idsNeedingFetch = videoIds.filter(id => {
        const existing = trackMap.get(id);
        return !existing || !existing.title || existing.title.startsWith("Track ") || existing.author === "Unknown Artist";
      }).slice(0, 30); // Limit per batch to keep response snappy

      if (idsNeedingFetch.length > 0) {
        console.info(`[SERVER RADIO ENRICH] Fetching oEmbed metadata for ${idsNeedingFetch.length} videos in playlist ${playlistId}...`);
        
        await Promise.allSettled(idsNeedingFetch.map(async (vId) => {
          try {
            const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vId}&format=json`;
            const resp = await fetch(oembedUrl, {
              headers: { "User-Agent": "Mozilla/5.0" }
            });
            if (resp.ok) {
              const data = await resp.json();
              trackMap.set(vId, {
                videoId: vId,
                title: data.title || `Track`,
                author: data.author_name || "Unknown Artist",
                thumbnailUrl: data.thumbnail_url || `https://img.youtube.com/vi/${vId}/hqdefault.jpg`
              });
            }
          } catch (e) {
            // Ignore individual oembed fetch failures
          }
        }));
      }

      // Build complete ordered track list based on input videoIds order
      const enrichedList: PlaylistTrack[] = videoIds.map((vId, idx) => {
        const existing = trackMap.get(vId);
        return existing || {
          videoId: vId,
          title: `Track ${idx + 1}`,
          author: "Unknown Artist",
          thumbnailUrl: `https://img.youtube.com/vi/${vId}/hqdefault.jpg`
        };
      });

      await savePlaylistCache(playlistId, enrichedList.slice(0, 400));
      res.json({ videos: enrichedList });
    } catch (err: any) {
      console.error("[ENRICH PLAYLIST ERROR]", err);
      res.status(500).json({ error: err.message || "Failed to enrich playlist tracks" });
    }
  });

  // API ROUTE: Stripe Connect OAuth URL
  app.get('/api/auth/stripe/url', (req, res) => {
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol || 'http';
    const redirectUri = `${protocol}://${host}/auth/stripe/callback`;

    const clientId = process.env.STRIPE_CONNECT_CLIENT_ID || "ca_F9O5W2jGvFv9nF089K89L89";

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: 'read_write',
      redirect_uri: redirectUri,
    });

    const authUrl = `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
    res.json({ url: authUrl });
  });

  // API ROUTE: Stripe Connect Callback
  app.get(['/auth/stripe/callback', '/auth/stripe/callback/'], async (req, res) => {
    const { code } = req.query;
    let stripeUserId = "acct_stripe_oauth_fallback_" + Math.random().toString(36).substring(2, 6).toUpperCase();

    if (code) {
      try {
        const stripe = await getStripeAsync();
        if (stripe) {
          const response = await stripe.oauth.token({
            grant_type: 'authorization_code',
            code: code as string,
          });
          stripeUserId = response.stripe_user_id || stripeUserId;
          console.log(`[STRIPE CONNECT SUCCESS] Linked Connect account: ${stripeUserId}`);
        }
      } catch (err: any) {
        console.error("[STRIPE CONNECT ERROR] OAuth token exchange failed:", err);
      }
    }

    res.send(`
      <html>
        <body style="background: #090b0e; color: #fff; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="text-align: center; border: 1px solid #1f2736; padding: 24px; border-radius: 12px; background: #12151e; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
            <div style="color: #00ffcc; font-size: 24px; margin-bottom: 12px;">✔️</div>
            <h3 style="margin: 0 0 8px 0; font-size: 16px;">Stripe Connected Successfully</h3>
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">This authorization window will close automatically.</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'STRIPE_AUTH_SUCCESS', stripeUserId: '${stripeUserId}' }, '*');
                setTimeout(() => window.close(), 1000);
              } else {
                window.location.href = '/';
              }
            </script>
          </div>
        </body>
      </html>
    `);
  });

  // API ROUTE: PayPal OAuth Auth URL
  app.get('/api/auth/paypal/url', (req, res) => {
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol || 'http';
    const redirectUri = `${protocol}://${host}/auth/paypal/callback`;

    const clientId = process.env.VITE_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || "AdM_mG6q4kXlH680L9f_ZqR9bK87jX08yP45zQ9aB8c7d6e5";

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      scope: 'openid email profile',
      redirect_uri: redirectUri,
    });

    const isSandbox = !process.env.PAYPAL_PRODUCTION;
    const authEndpoint = isSandbox 
      ? 'https://www.sandbox.paypal.com/signin/authorize'
      : 'https://www.paypal.com/signin/authorize';

    res.json({ url: `${authEndpoint}?${params.toString()}` });
  });

  // API ROUTE: PayPal OAuth Callback
  app.get(['/auth/paypal/callback', '/auth/paypal/callback/'], async (req, res) => {
    const { code } = req.query;
    let email = "sandbox_paypal_user@nexus.core";

    if (code) {
      try {
        const host = req.get('host') || 'localhost:3000';
        const protocol = req.protocol || 'http';
        const redirectUri = `${protocol}://${host}/auth/paypal/callback`;

        const clientId = process.env.VITE_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || "AdM_mG6q4kXlH680L9f_ZqR9bK87jX08yP45zQ9aB8c7d6e5";
        const clientSecret = process.env.PAYPAL_CLIENT_SECRET || "";

        if (clientSecret) {
          const isSandbox = !process.env.PAYPAL_PRODUCTION;
          const tokenUrl = isSandbox 
            ? 'https://api-m.sandbox.paypal.com/v1/oauth2/token'
            : 'https://api-m.paypal.com/v1/oauth2/token';

          const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
          
          const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code as string,
            redirect_uri: redirectUri,
          });

          const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
          });

          if (tokenResponse.ok) {
            const tokenData: any = await tokenResponse.json();
            const accessToken = tokenData.access_token;

            const userInfoUrl = isSandbox
              ? 'https://api-m.sandbox.paypal.com/v1/identity/oauth2/userinfo?schema=openid'
              : 'https://api-m.paypal.com/v1/identity/oauth2/userinfo?schema=openid';

            const userResponse = await fetch(userInfoUrl, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            });

            if (userResponse.ok) {
              const userData: any = await userResponse.json();
              email = userData.email || email;
              console.log(`[PAYPAL SUCCESS] Retrieved PayPal user email: ${email}`);
            }
          }
        }
      } catch (err: any) {
        console.error("[PAYPAL ERROR] Error exchanging code or retrieving user info:", err);
      }
    }

    res.send(`
      <html>
        <body style="background: #090b0e; color: #fff; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="text-align: center; border: 1px solid #1f2736; padding: 24px; border-radius: 12px; background: #12151e; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
            <div style="color: #38bdf8; font-size: 24px; margin-bottom: 12px;">✔️</div>
            <h3 style="margin: 0 0 8px 0; font-size: 16px;">PayPal Connected Successfully</h3>
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">This authorization window will close automatically.</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'PAYPAL_AUTH_SUCCESS', email: '${email}' }, '*');
                setTimeout(() => window.close(), 1000);
              } else {
                window.location.href = '/';
              }
            </script>
          </div>
        </body>
      </html>
    `);
  });

  // API ROUTE: Test email connectivity and get API Key presence info
  app.get("/api/emails/test-connectivity", (req, res) => {
    const rawKey = process.env.RESEND_API_KEY || "";
    const present = rawKey.trim().length > 0;
    
    let masked = "Not configured";
    if (present) {
      const trimmed = rawKey.trim();
      if (trimmed.length > 8) {
        masked = `${trimmed.substring(0, 5)}...${trimmed.substring(trimmed.length - 4)}`;
      } else {
        masked = "Configured (too short)";
      }
    }

    res.json({
      resend_enabled: !!getResend(),
      apiKeyPresent: present,
      apiKeyMasked: masked,
      apiKeyLength: rawKey.length,
    });
  });

  // API ROUTE: Get live dispatch logs for debugging
  app.get("/api/emails/dispatch-logs", (req, res) => {
    res.json({ logs: emailLogs });
  });

  // API ROUTE: Send a test email of any content and diagnose response
  app.post("/api/emails/send-test", async (req, res) => {
    const { toEmail, fromEmail = "info@thenexuscoreapp.com" } = req.body;
    const fromLine = `Nexus Core Test <${fromEmail}>`;
    const subject = "Nexus Core - Diagnostic Email Connectivity Test";
    const host = req.headers.host;
    const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const appUrl = process.env.APP_URL || (host ? `${protocol}://${host}` : 'http://localhost:3000');
    
    try {
      const resend = getResend();
      if (!resend) {
        recordEmailLog('send-test', toEmail || '', fromLine, subject, 'SIMULATED', { error: 'No RESEND_API_KEY config' });
        return res.status(400).json({ 
          error: "Resend client is not initialized because RESEND_API_KEY is not defined in the environment." 
        });
      }

      if (!toEmail) {
        return res.status(400).json({ error: "Destination email 'toEmail' is required." });
      }

      const rawHtml = `
        <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; margin-top: 0; margin-bottom: 16px; font-family: 'SFMono-Regular', Consolas, monospace; text-transform: uppercase; color: #00ffcc;">[ Diagnostic Handshake Successful ]</h2>
        <p style="margin: 0 0 16px 0; color: #d4d4d8;">Hello Administrator,</p>
        <p style="margin: 0 0 24px 0; color: #d4d4d8; line-height: 1.6;">
          This diagnostic message certifies that your <strong>Resend Email Gateway API Integration</strong> is fully active, authenticated, and communicating correctly with the Nexus Core live servers!
        </p>

        <!-- Diagnostic Variables -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #171d29; border: 1px solid #232c3f; border-radius: 8px; margin-bottom: 24px; border-collapse: collapse;">
          <tr>
            <td style="padding: 16px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 11px; color: #a1a1aa; line-height: 1.5;">
              <div style="color: #00ffcc; font-weight: bold; margin-bottom: 6px; font-size: 12px; text-transform: uppercase;">// HANDSHAKE METADATA //</div>
              <div style="margin-bottom: 4px;">SECURITY_GATE: ACTIVE_SUCCESS</div>
              <div style="margin-bottom: 4px;">DISPATCH_TIME: ${new Date().toISOString()}</div>
              <div>RECIPIENT_TAG: ${toEmail}</div>
            </td>
          </tr>
        </table>

        <p style="margin: 0; font-size: 12px; color: #71717a;">
          If you received this message, emails created within high-priority systems (such as crew team onboardings, fan club signups, or instant ticket allocations) will be securely routed and dispatched to real mailboxes instantly.
        </p>
      `;

      const { data, error } = await resend.emails.send({
        from: fromLine,
        to: toEmail,
        subject: subject,
        html: getNexusEmailWrapper(rawHtml, "Diagnostic connectivity handshake verification successful.", appUrl)
      });

      if (error) {
        console.error("Resend API Diagnostic Error returned:", error);
        recordEmailLog('send-test', toEmail, fromLine, subject, 'FAILED', error);
        return res.status(400).json({ success: false, error });
      }

      recordEmailLog('send-test', toEmail, fromLine, subject, 'SUCCESS', data);
      res.json({ success: true, data });
    } catch (e: any) {
      console.error("Resend Exception caught:", e);
      recordEmailLog('send-test', toEmail || '', fromLine, subject, 'FAILED', { message: e.message, stack: e.stack });
      res.status(500).json({ 
        success: false, 
        error: e.message || "An exception occurred while invoking the Resend client.",
        stack: e.stack
      });
    }
  });

  // API ROUTE: Send Team Invite Email
  app.post("/api/emails/invite", async (req, res) => {
    const { email, role, inviterEmail, bandName, bandId } = req.body;
    const fromLine = 'Nexus Core App <invites@thenexuscoreapp.com>';
    const subject = `You have been invited to join ${bandName || 'a team'} on Nexus Core`;
    const host = req.headers.host;
    const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const appUrl = process.env.APP_URL || (host ? `${protocol}://${host}` : 'http://localhost:3000');
    
    try {
      const resend = getResend();
      if (!resend) {
        recordEmailLog('invite', email || '', fromLine, subject, 'SIMULATED', { error: 'No RESEND_API_KEY config' });
        return res.json({ simulated: true, message: "Email simulation successful (no RESEND_API_KEY)" });
      }

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const inviteUrl = `${process.env.APP_URL || 'http://localhost:3000'}/dev/dashboard?accept_invite=1&email=${encodeURIComponent(email)}&role=${encodeURIComponent(role || '')}&band=${encodeURIComponent(bandName || '')}&band_id=${encodeURIComponent(bandId || '')}`;

      const rawHtml = `
        <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; margin-top: 0; margin-bottom: 20px; font-family: 'SFMono-Regular', Consolas, monospace; text-transform: uppercase; color: #00ffcc;">[ Crew Invite Active ]</h2>
        <p style="margin: 0 0 16px 0; color: #d4d4d8;">Hello,</p>
        <p style="margin: 0 0 20px 0; color: #d4d4d8; line-height: 1.6;">
          You have been authorized by <strong>${inviterEmail || 'A team manager'}</strong> to activate an operator session. 
          You've been invited to join the <strong>${bandName || 'Touring Group'}</strong> workspace as a <strong>${role || 'Staff Operator'}</strong>.
        </p>

        <!-- Invite Credentials Information Card -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #171d29; border: 1px solid #232c3f; border-radius: 8px; margin-bottom: 28px; border-collapse: collapse;">
          <tr>
            <td style="padding: 18px;">
              <div style="font-size: 10px; font-weight: 800; color: #8f9cae; text-transform: uppercase; font-family: 'SFMono-Regular', Consolas, monospace; margin-bottom: 6px; letter-spacing: 1px;">// INTENDED CREW RECIPIENT</div>
              <div style="font-size: 14px; font-weight: bold; color: #ffffff; margin-bottom: 14px; font-family: sans-serif;">${email}</div>
              
              <div style="font-size: 10px; font-weight: 800; color: #8f9cae; text-transform: uppercase; font-family: 'SFMono-Regular', Consolas, monospace; margin-bottom: 4px; letter-spacing: 1px;">ROLE CONFIGURATION</div>
              <div style="font-size: 13px; font-weight: bold; color: #a855f7; font-family: sans-serif;">${role || 'Team Member'}</div>
            </td>
          </tr>
        </table>

        <p style="margin: 0 0 24px 0; color: #d4d4d8;">
          Click the link below to accept the invitation and set up your account on the secure network. This will open straight to the registration console with your email, role, and workspace parameters prefilled.
        </p>

        <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-top: 10px; margin-bottom: 24px;">
          <tr>
            <td align="center" bgcolor="#00ffcc" style="border-radius: 6px;">
              <a href="${inviteUrl}" target="_blank" style="display: inline-block; background-color: #00ffcc; color: #080a0f; font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 12px; font-weight: 900; line-height: 1.2; text-decoration: none; padding: 15px 30px; border-radius: 6px; text-transform: uppercase; letter-spacing: 1.5px; border: 1px solid #00ffcc;">
                [ ACTIVATE CREW CONSOLE ]
              </a>
            </td>
          </tr>
        </table>

        <p style="margin: 0; font-size: 11px; color: #71717a;">
          If you believe you received this routing invitation in error or did not ask to collaborate with ${bandName || 'this artist'}, please disregard this message safely.
        </p>
      `;

      const { data, error } = await resend.emails.send({
        from: fromLine,
        to: email, 
        subject: subject,
        html: getNexusEmailWrapper(rawHtml, `Authorized invitation to join ${bandName || 'crew'} as ${role || 'operator'}.`, appUrl)
      });

      if (error) {
        recordEmailLog('invite', email, fromLine, subject, 'FAILED', error);
        return res.status(400).json({ error });
      }

      recordEmailLog('invite', email, fromLine, subject, 'SUCCESS', data);
      res.json({ success: true, data });
    } catch (e: any) {
      console.error("Invite Email Error:", e);
      recordEmailLog('invite', email || '', fromLine, subject, 'FAILED', { message: e.message });
      res.status(500).json({ error: e.message });
    }
  });

  // API ROUTE: Send Guestlist Confirmation Email
  app.post("/api/emails/guestlist", async (req, res) => {
    const { email, guestName, bandName, showDate, venueName, passType = 'General', additionalCount = 0 } = req.body;
    const fromLine = 'Nexus Core App <guestlist@thenexuscoreapp.com>';
    const subject = `Your Guestlist Pass for ${bandName || 'the show'}`;
    const host = req.headers.host;
    const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const appUrl = process.env.APP_URL || (host ? `${protocol}://${host}` : 'http://localhost:3000');
    
    // Map dropdown option to official layout string
    let displayPassType = 'General Guest Entry Pass';
    if (passType.toLowerCase() === 'vip') {
      displayPassType = 'VIP Access Pass';
    } else if (passType.toLowerCase() === 'crew') {
      displayPassType = 'Crew Member All-Access';
    } else if (passType.toLowerCase() === 'media' || passType.toLowerCase() === 'press') {
      displayPassType = 'Media & Press Credential';
    }
    
    // Total headcount text
    const headcountText = additionalCount > 0 
      ? `${displayPassType} (+${additionalCount} Additional Guests)`
      : `${displayPassType} (1x)`;

    const confirmationUrl = `${appUrl}/?guest_confirm=1&email=${encodeURIComponent(email || '')}&guestName=${encodeURIComponent(guestName || '')}&band=${encodeURIComponent(bandName || '')}&date=${encodeURIComponent(showDate || '')}&venue=${encodeURIComponent(venueName || '')}&pass_type=${encodeURIComponent(passType)}`;

    try {
      const resend = getResend();
      if (!resend) {
        recordEmailLog('guestlist', email || '', fromLine, subject, 'SIMULATED', { error: 'No RESEND_API_KEY config' });
        return res.json({ simulated: true, message: "Email simulation successful (no RESEND_API_KEY)" });
      }

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const rawHtml = `
        <h2 style="color: #00ffcc; font-size: 20px; font-weight: 800; margin-top: 0; margin-bottom: 16px; font-family: 'SFMono-Regular', Consolas, monospace; text-transform: uppercase; text-align: center;">
          [ GUESTLIST ]<br/>
          <span style="font-size: 14px; color: #ffffff; font-weight: bold; letter-spacing: 1px;">- Pass Confirmed -</span>
        </h2>
        <p style="margin: 0 0 16px 0; color: #d4d4d8; text-align: center;">Hello <strong>${guestName || 'VIP Guest'}</strong>,</p>
        <p style="margin: 0 0 24px 0; color: #d4d4d8; line-height: 1.6; text-align: center;">
          Your credential access has been processed successfully. You are officially listed on the exclusive artist guestlist for <strong>${bandName || 'the concert'}</strong>. See confirmation details below:
        </p>

        <!-- Pass Details Table -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #171d29; border: 1px solid #232c3f; border-radius: 8px; margin-bottom: 24px; border-collapse: collapse; margin-left: auto; margin-right: auto;">
          <tr>
            <td style="padding: 20px; text-align: center;" align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                ${venueName ? `
                <tr>
                  <td style="padding-bottom: 12px; font-family: sans-serif; text-align: center;" align="center">
                    <div style="font-size: 10px; font-weight: 800; color: #8f9cae; text-transform: uppercase; font-family: 'SFMono-Regular', Consolas, monospace; letter-spacing: 1px; text-align: center;">VENUE LOCATION</div>
                    <div style="font-size: 14px; font-weight: bold; color: #ffffff; margin-top: 3px; text-align: center;">${venueName}</div>
                  </td>
                </tr>
                ` : ''}
                ${showDate ? `
                <tr>
                  <td style="padding-bottom: 12px; font-family: sans-serif; text-align: center;" align="center">
                    <div style="font-size: 10px; font-weight: 800; color: #8f9cae; text-transform: uppercase; font-family: 'SFMono-Regular', Consolas, monospace; letter-spacing: 1px; text-align: center;">EVENT DATE</div>
                    <div style="font-size: 14px; font-weight: bold; color: #ffffff; margin-top: 3px; text-align: center;">${showDate}</div>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="font-family: sans-serif; text-align: center;" align="center">
                    <div style="font-size: 10px; font-weight: 800; color: #8f9cae; text-transform: uppercase; font-family: 'SFMono-Regular', Consolas, monospace; letter-spacing: 1px; text-align: center;">CREDENTIAL / PASS TYPE</div>
                    <div style="font-size: 14px; font-weight: bold; color: #a855f7; margin-top: 3px; text-transform: uppercase; text-align: center;">${headcountText}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Security Badge Box / Clickable Verification Gate -->
        <div style="margin-top: 24px; margin-bottom: 24px; text-align: center;">
          <a href="${confirmationUrl}" target="_blank" style="display: block; text-decoration: none; padding: 16px 12px; background-color: #080a0f; border: 1px dashed #00ffcc; text-align: center; border-radius: 8px;">
            <div style="font-size: 8px; font-family: 'SFMono-Regular', Consolas, monospace; color: #71717a; margin-bottom: 6px; letter-spacing: 2px; text-transform: uppercase;">SECURE PASS STATUS: CLICK TO ACTIVATE</div>
            <div style="font-size: 11px; font-weight: bold; letter-spacing: 1.5px; color: #00ffcc; font-family: 'SFMono-Regular', Consolas, monospace; text-transform: uppercase; white-space: nowrap;">[ GUESTLIST_ACCESS ]</div>
          </a>
        </div>

        <p style="margin: 0; font-size: 12px; color: #71717a; line-height: 1.5; text-align: center;">
          <strong>Instructions:</strong> Please present a copy of this email state (on your mobile device or printout) along with a valid photo identification card at the venue door, promoter box office, or guestlist check-in station.
        </p>
      `;

      const { data, error } = await resend.emails.send({
        from: fromLine,
        to: email,
        subject: subject,
        html: getNexusEmailWrapper(rawHtml, `Your guestlist credentials for ${bandName || 'the artist'} are confirmed.`, appUrl)
      });

      if (error) {
        recordEmailLog('guestlist', email, fromLine, subject, 'FAILED', error);
        return res.status(400).json({ error });
      }

      recordEmailLog('guestlist', email, fromLine, subject, 'SUCCESS', data);
      res.json({ success: true, data });
    } catch (e: any) {
      console.error("Guestlist Email Error:", e);
      recordEmailLog('guestlist', email || '', fromLine, subject, 'FAILED', { message: e.message });
      res.status(500).json({ error: e.message });
    }
  });

  // API ROUTE: Send VIP Loyalty Club Welcome Email
  app.post("/api/emails/vip-loyalty", async (req, res) => {
    const { email, fanName, bandName, discountCode } = req.body;
    const fromLine = 'Nexus Core App <vip@thenexuscoreapp.com>';
    const subject = `Welcome to the VIP List, ${fanName}!`;
    const host = req.headers.host;
    const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const appUrl = process.env.APP_URL || (host ? `${protocol}://${host}` : 'http://localhost:3000');
    
    try {
      const resend = getResend();
      if (!resend) {
        recordEmailLog('vip-loyalty', email || '', fromLine, subject, 'SIMULATED', { error: 'No RESEND_API_KEY config' });
        return res.json({ simulated: true, message: "Email simulation successful (no RESEND_API_KEY)" });
      }

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const rawHtml = `
        <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; margin-top: 0; margin-bottom: 16px; font-family: 'SFMono-Regular', Consolas, monospace; text-transform: uppercase; color: #00ffcc;">[ VIP Fan Club Welcome ]</h2>
        <p style="margin: 0 0 16px 0; color: #d4d4d8;">Hey <strong>${fanName}</strong>,</p>
        <p style="margin: 0 0 24px 0; color: #d4d4d8; line-height: 1.6;">
          You are officially registered and approved on the exclusive VIP roster update for <strong>${bandName || 'our touring group'}</strong>! We are deeply grateful for your loyalty and support.
        </p>
        <p style="margin: 0 0 24px 0; color: #d4d4d8; line-height: 1.6;">
          As an authorized VIP member, you will receive first-priority notifications regarding private regional tour updates, exclusive merchandise line previews, and restricted pre-sale passwords.
        </p>

        <!-- Discount Code Area -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #080a0f; border: 1px solid #1f2736; border-radius: 8px; margin-bottom: 24px; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 24px 16px;">
              <div style="font-size: 10px; font-family: 'SFMono-Regular', Consolas, monospace; color: #71717a; margin-bottom: 8px; letter-spacing: 2px; text-transform: uppercase;">YOUR PERSONAL EXCLUSIVE TOURING DISCOUNT CODE</div>
              <div style="font-size: 28px; font-weight: 900; letter-spacing: 3px; color: #00ffcc; font-family: 'SFMono-Regular', Consolas, monospace; text-shadow: 0 0 10px rgba(0, 255, 204, 0.4); margin: 6px 0 12px 0;">
                ${discountCode || 'VIP10OFF'}
              </div>
              <div style="height: 1px; width: 120px; background-color: #1f2736; margin: 0 auto 12px auto;"></div>
              <p style="margin: 0; font-size: 11px; color: #a1a1aa; font-family: sans-serif;">
                Show this transmission at the concert venue merch booth or enter during online checkout.
              </p>
            </td>
          </tr>
        </table>

        <p style="margin: 0; font-size: 11px; color: #71717a;">
          You subscribed willingly via the Nexus Core Fan Kiosk. You may unsubscribe or edit your alert state at any time by replying directly to this thread.
        </p>
      `;

      const { data, error } = await resend.emails.send({
        from: fromLine,
        to: email,
        subject: subject,
        html: getNexusEmailWrapper(rawHtml, `Welcome to the exclusive VIP List for ${bandName || 'our crew'}!`, appUrl)
      });

      if (error) {
        recordEmailLog('vip-loyalty', email, fromLine, subject, 'FAILED', error);
        return res.status(400).json({ error });
      }

      recordEmailLog('vip-loyalty', email, fromLine, subject, 'SUCCESS', data);
      res.json({ success: true, data });
    } catch (e: any) {
      console.error("VIP Email Error:", e);
      recordEmailLog('vip-loyalty', email || '', fromLine, subject, 'FAILED', { message: e.message });
      res.status(500).json({ error: e.message });
    }
  });

  // API ROUTE: Stripe Checkout / Payment Intent for Escrow
  app.post("/api/payments/create-escrow-intent", async (req, res) => {
    try {
      const { amount, currency = 'usd', connectAccountId } = req.body;
      const stripe = await getStripeAsync();
      
      if (!stripe) {
        return res.status(500).json({ error: "Stripe is not configured on the server." });
      }

      // Step 1: Create PaymentIntent for the Escrow amount
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects cents
        currency,
        // Optional: transferring a portion to a connected Creative Account directly
        // transfer_data: connectAccountId ? { destination: connectAccountId } : undefined,
        // For escrow, we might capture later:
        capture_method: 'manual', 
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // API ROUTE: Connect Account setup linking (Creatives getting paid via Stripe)
  app.post("/api/payments/create-connect-account", async (req, res) => {
    try {
      const stripe = await getStripeAsync();
      if (!stripe) {
        return res.status(500).json({ error: "Stripe is not configured." });
      }

      // In a real system, you map this to the authenticated creative's DB record
      const account = await stripe.accounts.create({
        type: 'express', // Express allows Stripe to handle onboarding UI
      });

      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${req.protocol}://${req.get('host')}/dev/dashboard?connect_fail=1`,
        return_url: `${req.protocol}://${req.get('host')}/dev/dashboard?connect_success=1`,
        type: 'account_onboarding',
      });

      res.json({ url: accountLink.url, accountId: account.id });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // API ROUTE: Release Escrow (Transfers funds to Connected Account)
  app.post("/api/payments/release-escrow", async (req, res) => {
    try {
      const { amount, connectAccountId } = req.body;
      const stripe = await getStripeAsync();
      
      if (!stripe) {
        return res.status(500).json({ error: "Stripe is not configured on the server." });
      }

      if (!connectAccountId) {
        return res.status(400).json({ error: "Missing connectAccountId. The creative must have a linked Stripe Connect account." });
      }

      // Instead of pulling from platform balance, we simulate the original 
      // client (e.g. band) payment transferring to the creative's connected account
      const amountInCents = Math.round(amount * 100);
      const feeInCents = Math.round(amountInCents * 0.0777);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents, // Stripe expects cents
        currency: 'usd',
        payment_method: 'pm_card_visa', // Use test card to bypass platform balance errors in test mode
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        },
        transfer_data: {
          destination: connectAccountId,
        },
        application_fee_amount: feeInCents,
        description: 'Simulated Escrow Release from Platform Client',
      });

      res.json({ success: true, transferId: paymentIntent.id });
    } catch (e: any) {
      console.error("Escrow Release Error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // API ROUTE: Create Billing Checkout Session for Subscriptions or Flat Passes
  app.post("/api/payments/create-billing-checkout", async (req, res) => {
    try {
      const { tierId, billingCycle = 'monthly', role = 'band', stripeCustomerId, stripeAccountId, email } = req.body;
      const stripe = await getStripeAsync();

      // Normalize parameters to resolve user's specified inputs
      const tier = (tierId || req.body.tier || "band_pro").toLowerCase();
      const interval = (billingCycle || req.body.interval || "monthly").toLowerCase();

      // 2. DYNAMIC LOOKUP LOGIC FOR CHECKOUT PAYLOADS
      // Use switch/case blocks to map parameters directly to Supabase Vault lookup keys
      let vaultKey = "";
      switch (tier) {
        case "band_pro":
        case "touring_pro":
          vaultKey = interval === "yearly" || interval === "annual" || interval === "year"
            ? "PRICE_ID_BAND_PRO_YEARLY"
            : "PRICE_ID_BAND_PRO_MONTHLY";
          break;
        case "band_plus":
        case "touring_pro_plus":
        case "band_pro_plus":
          vaultKey = interval === "yearly" || interval === "annual" || interval === "year"
            ? "PRICE_ID_BAND_PLUS_YEARLY"
            : "PRICE_ID_BAND_PLUS_MONTHLY";
          break;
        case "promoter_power":
        case "power_user":
          vaultKey = "PRICE_ID_PROMOTER_POWER_MONTHLY";
          break;
        case "promoter_enterprise":
        case "enterprise_circuit":
          vaultKey = "PRICE_ID_PROMOTER_ENTERPRISE_MONTHLY";
          break;
        case "per_show":
          vaultKey = "PRICE_ID_BAND_PERSHOW";
          break;
        case "per_tour":
          vaultKey = "PRICE_ID_BAND_PERTOUR";
          break;
        default:
          vaultKey = `PRICE_ID_${tier.toUpperCase()}_${interval.toUpperCase()}`;
          break;
      }

      console.log(`[VAULT TRANS] Mapped sub-node combo (tier: "${tier}", interval: "${interval}") to target vault lookup key: "${vaultKey}"`);

      const getTierInfo = (tId: string, cycle: string) => {
        switch (tId) {
          case "per_show":
            return { name: "Per Show Flat Pass", amount: 599 };
          case "per_tour":
            return { name: "Per Tour Flat Pass", amount: 4999 };
          case "touring_pro":
          case "band_pro":
            return cycle === "annual" || cycle === "yearly"
              ? { name: "Touring Pro (Annual)", amount: 18230 }
              : { name: "Touring Pro (Monthly)", amount: 1899 };
          case "touring_pro_plus":
          case "band_pro_plus":
          case "band_plus":
            return cycle === "annual" || cycle === "yearly"
              ? { name: "Touring Pro + (Annual)", amount: 28790 }
              : { name: "Touring Pro + (Monthly)", amount: 2999 };
          case "power_user":
          case "promoter_power":
            return cycle === "annual" || cycle === "yearly"
              ? { name: "Power User (Annual)", amount: 85440 }
              : { name: "Power User (Monthly)", amount: 8900 };
          case "enterprise_circuit":
          case "promoter_enterprise":
            return cycle === "annual" || cycle === "yearly"
              ? { name: "Enterprise Circuit (Annual)", amount: 239040 }
              : { name: "Enterprise Circuit (Monthly)", amount: 24900 };
          default:
            return { name: "Standard Subscription", amount: 1000 };
        }
      };

      const tierInfo = getTierInfo(tier, interval);
      const isFlat = tier === "per_show" || tier === "per_tour";
      const mode = isFlat ? "payment" : "subscription";

      const host = req.get("host") || "localhost:3000";
      const protocol = req.protocol || "http";
      const redirectUrl = `${protocol}://${host}/dev/dashboard`;

      // Simulating when Stripe secret key / Stripe client is not enabled
      if (!stripe) {
        // Fallback simulated checkout url for testing and preview modes if Stripe is not initialized
        const mockSessionId = `cs_test_${Math.random().toString(36).substring(2, 10)}`;
        return res.json({ 
          url: `${redirectUrl}?mock_checkout_success=1&session_id=${mockSessionId}&tierId=${tier}&cycle=${interval}`, 
          id: mockSessionId,
          simulated: true
        });
      }

      // Fetch dynamic price ID directly from the Supabase Vault utilizing get_decrypted_secret RPC and service role context
      const priceId = await getVaultSecret(vaultKey);
      
      let session;

      if (priceId) {
        console.log(`[VAULT] Resolved dynamic price credentials: "${vaultKey}" -> "${priceId}"`);

        // 3. STRIPE PAYLOAD INJECTION
        const sessionPayload: any = {
          payment_method_types: ["card"],
          line_items: [
            {
              price: priceId,
              quantity: 1,
            }
          ],
          mode: mode,
          success_url: `${redirectUrl}?checkout_success=1&session_id={CHECKOUT_SESSION_ID}&tierId=${tier}&cycle=${interval}`,
          cancel_url: `${redirectUrl}?checkout_cancel=1`,
          metadata: {
            tierId: tier,
            billingCycle: interval,
            email: email || ''
          }
        };

        if (stripeCustomerId && stripeCustomerId.startsWith("cus_") && !stripeCustomerId.includes("mock")) {
          sessionPayload.customer = stripeCustomerId;
        } else if (email) {
          sessionPayload.customer_email = email;
        }

        const sessionOptions = stripeAccountId && stripeAccountId.startsWith("acct_") ? { stripeAccount: stripeAccountId } : undefined;

        try {
          session = await stripe.checkout.sessions.create(sessionPayload, sessionOptions);
        } catch (stripeErr: any) {
          console.log(`[STRIPE] Primary price ID creation deferred (Reason: ${stripeErr.message}). Attempting design fallback with dynamic price data...`);
        }
      }

      // If priceId not found or primary session creation deferred, use the inline dynamic price_data setup
      if (!session) {
        try {
          const fallbackPayload: any = {
            payment_method_types: ["card"],
            line_items: [
              {
                price_data: {
                  currency: "usd",
                  product_data: {
                    name: tierInfo.name,
                    description: `Nexus Core - Premium Tier: ${tierInfo.name}`,
                  },
                  unit_amount: tierInfo.amount,
                  recurring: mode === "subscription" ? { interval: interval === "annual" || interval === "yearly" ? "year" : "month" } : undefined,
                },
                quantity: 1,
              }
            ],
            mode: mode,
            success_url: `${redirectUrl}?checkout_success=1&session_id={CHECKOUT_SESSION_ID}&tierId=${tier}&cycle=${interval}`,
            cancel_url: `${redirectUrl}?checkout_cancel=1`,
            metadata: {
              tierId: tier,
              billingCycle: interval,
              email: email || ''
            }
          };

          if (stripeCustomerId && stripeCustomerId.startsWith("cus_") && !stripeCustomerId.includes("mock")) {
            fallbackPayload.customer = stripeCustomerId;
          } else if (email) {
            fallbackPayload.customer_email = email;
          }

          const sessionOptions = stripeAccountId && stripeAccountId.startsWith("acct_") ? { stripeAccount: stripeAccountId } : undefined;

          session = await stripe.checkout.sessions.create(fallbackPayload, sessionOptions);
        } catch (fallbackErr: any) {
          console.log(`[STRIPE RECOVERY] Creation bypassed due to sandbox config. Generating fully simulated interactive billing session...`);
          const mockSessionId = `cs_test_${Math.random().toString(36).substring(2, 10)}`;
          return res.json({ 
            url: `${redirectUrl}?mock_checkout_success=1&session_id=${mockSessionId}&tierId=${tier}&cycle=${interval}`, 
            id: mockSessionId,
            simulated: true
          });
        }
      }

      res.json({ url: session.url, id: session.id, simulated: false });
    } catch (e: any) {
      console.error("Billing Checkout Session Error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Generic Checkout Payment Intent
  app.post('/api/checkout/create-intent', async (req: express.Request, res: express.Response) => {
    try {
      const { amount, currency = 'usd', merchantId } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      const stripe = await getStripeAsync();
      if (!stripe) {
        return res.json({ clientSecret: `pi_mock_secret_${Date.now()}`, simulated: true });
      }

      const amountInCents = Math.round(amount * 100);
      const feeInCents = Math.round(amountInCents * 0.0777); // 7.77% platform fee

      const paymentIntentParams: any = {
        amount: amountInCents,
        currency,
      };

      if (merchantId && typeof merchantId === 'string' && merchantId.startsWith('acct_')) {
        // If a valid Stripe Connected account ID is provided
        paymentIntentParams.transfer_data = { destination: merchantId };
        paymentIntentParams.application_fee_amount = feeInCents;
      }

      try {
        const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
        return res.json({ clientSecret: paymentIntent.client_secret, simulated: false });
      } catch (intentErr: any) {
        console.warn('[STRIPE INTENT FALLBACK]', intentErr.message);
        return res.json({ clientSecret: `pi_mock_secret_${Date.now()}`, simulated: true });
      }
    } catch (err: any) {
      console.error('[CREATE INTENT ERROR]', err);
      return res.json({ clientSecret: `pi_mock_secret_${Date.now()}`, simulated: true });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Support client-side routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
