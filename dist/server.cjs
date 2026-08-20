var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_stripe = __toESM(require("stripe"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_supabase_js = require("@supabase/supabase-js");
var import_resend = require("resend");
var import_fs = __toESM(require("fs"), 1);
import_dotenv.default.config();
var supabaseServiceClient = null;
function getSupabaseService() {
  if (!supabaseServiceClient) {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (url && serviceRoleKey) {
      supabaseServiceClient = (0, import_supabase_js.createClient)(url, serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
    }
  }
  return supabaseServiceClient;
}
var VAULT_LOCAL_FALLBACKS = {
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
async function getVaultSecret(secretName) {
  const upperName = secretName.toUpperCase();
  const lowerName = secretName.toLowerCase();
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
  } catch (err) {
    console.log(`[VAULT INFO] Lookup for vault key "${secretName}" deferred to local configuration. Reason:`, err.message || err);
    return VAULT_LOCAL_FALLBACKS[upperName] || VAULT_LOCAL_FALLBACKS[lowerName] || null;
  }
}
var stripeClient = null;
async function getStripeAsync() {
  if (stripeClient) return stripeClient;
  const secretKey = await getVaultSecret("STRIPE_SECRET_KEY");
  if (secretKey) {
    stripeClient = new import_stripe.default(secretKey, {
      apiVersion: "2026-05-27.dahlia"
    });
  }
  return stripeClient;
}
var resendClient = null;
function getResend() {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new import_resend.Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}
var emailLogs = [];
function recordEmailLog(endpoint, to, from, subject, status, details) {
  const entry = {
    id: "elog_" + Math.random().toString(36).substring(2, 9),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
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
function getNexusEmailWrapper(contentHtml, previewText = "Nexus Core Dispatch", appUrl = "https://thenexuscoreapp.com") {
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
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.post("/api/webhooks/stripe", import_express.default.raw({ type: "application/json" }), async (req, res) => {
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
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
      } else {
        event = JSON.parse(req.body.toString());
      }
    } catch (err) {
      console.error(`[WEBHOOK ERROR] Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    console.log(`[STRIPE WEBHOOK] Received event of type: ${event.type}`);
    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        console.log(`[STRIPE WEBHOOK] Checkout completed for session: ${session.id}`, session);
        const email = session.customer_email || session.metadata && session.metadata.email;
        const tier = session.metadata && session.metadata.tierId;
        const cycle = session.metadata && session.metadata.billingCycle;
        console.log(`[STRIPE WEBHOOK SUCCESS] Handled subscription checkout completed for ${email} -> ${tier} (${cycle})`);
        const supabase = getSupabaseService();
        if (supabase && email) {
          const { data: profile } = await supabase.from("profiles").select("*").eq("email", email).maybeSingle();
          if (profile) {
            await supabase.from("profiles").update({
              sub_tier: tier,
              subscription_status: "active",
              stripe_customer_id: session.customer || profile.stripe_customer_id
            }).eq("id", profile.id);
            console.log(`[STRIPE WEBHOOK DB SYNC] Successfully updated profile ${profile.id} with tier: ${tier}`);
          }
        }
      }
      res.json({ received: true });
    } catch (err) {
      console.error(`[WEBHOOK ERROR] Error handling event ${event.type}:`, err);
      res.status(500).json({ error: err.message });
    }
  });
  app.use(import_express.default.json({ limit: "50mb" }));
  app.use(import_express.default.urlencoded({ limit: "50mb", extended: true }));
  const uploadsDir = import_path.default.join(process.cwd(), "uploads");
  if (!import_fs.default.existsSync(uploadsDir)) {
    import_fs.default.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", import_express.default.static(uploadsDir));
  const avatarInteractionsFile = import_path.default.join(uploadsDir, "avatar_interactions.json");
  let avatarInteractions = {};
  try {
    if (import_fs.default.existsSync(avatarInteractionsFile)) {
      const fileContent = import_fs.default.readFileSync(avatarInteractionsFile, "utf8");
      avatarInteractions = JSON.parse(fileContent);
    }
  } catch (e) {
    console.error("Failed to load avatar interactions:", e);
  }
  const saveAvatarInteractions = async () => {
    try {
      await import_fs.default.promises.writeFile(avatarInteractionsFile, JSON.stringify(avatarInteractions, null, 2), "utf8");
    } catch (e) {
      console.error("Failed to save avatar interactions:", e);
    }
  };
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
      (r) => r.userId === userId && r.emoji === emoji
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
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    interactions.comments.push(newComment);
    await saveAvatarInteractions();
    res.json(interactions);
  });
  app.post("/api/upload", async (req, res) => {
    try {
      const { base64Data, bucket, userId, fileNameToken } = req.body;
      if (!base64Data) {
        return res.status(400).json({ error: "Missing base64Data" });
      }
      const matches = base64Data.match(/^data:([^;]+);base64,([\s\S]+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Invalid base64 data format" });
      }
      const contentType = matches[1];
      const base64Image = matches[2].replace(/\s+/g, "");
      const buffer = Buffer.from(base64Image, "base64");
      const fileExt = contentType.split("/")[1] || "webp";
      const cleanFileNameToken = (fileNameToken || "image").replace(/[^a-zA-Z0-9-_]/g, "_");
      const uniqueName = `${userId || "anonymous"}_${bucket || "assets"}_${cleanFileNameToken}_${Date.now()}.${fileExt}`;
      const supabase = getSupabaseService();
      if (supabase && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const bucketName = bucket || "avatars";
        try {
          const { data: buckets, error: listError } = await supabase.storage.listBuckets();
          if (!listError && buckets) {
            const bucketExists = buckets.some((b) => b.name === bucketName);
            if (!bucketExists) {
              console.info(`[SERVER UPLOAD] Creating public bucket: ${bucketName}`);
              await supabase.storage.createBucket(bucketName, {
                public: true,
                fileSizeLimit: 10485760
                // 10MB
              });
            }
          }
          const { error: uploadError } = await supabase.storage.from(bucketName).upload(uniqueName, buffer, {
            contentType,
            upsert: true
          });
          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(uniqueName);
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
      const filePath = import_path.default.join(uploadsDir, uniqueName);
      await import_fs.default.promises.writeFile(filePath, buffer);
      const publicUrl = `/uploads/${uniqueName}`;
      console.info(`[SERVER UPLOAD FALLBACK SUCCESS] Saved ${bucket || "assets"}/${cleanFileNameToken} locally to ${publicUrl}`);
      res.json({ publicUrl });
    } catch (err) {
      console.error("[SERVER UPLOAD ERROR]", err);
      res.status(500).json({ error: err.message || "Failed to save file" });
    }
  });
  app.get("/api/health", async (req, res) => {
    res.json({ status: "ok", stripe_enabled: !!await getStripeAsync(), resend_enabled: !!getResend() });
  });
  const playlistMemoryCache = /* @__PURE__ */ new Map();
  const GLOBAL_PLAYLIST_STORAGE_FILE = import_path.default.join(process.cwd(), "data", "scene_radio_global_playlists.json");
  function readGlobalPlaylistFile() {
    try {
      if (import_fs.default.existsSync(GLOBAL_PLAYLIST_STORAGE_FILE)) {
        const content = import_fs.default.readFileSync(GLOBAL_PLAYLIST_STORAGE_FILE, "utf-8");
        return JSON.parse(content) || {};
      }
    } catch (e) {
      console.warn("[SERVER RADIO] Could not read global playlist file:", e);
    }
    return {};
  }
  function writeGlobalPlaylistFile(dataMap) {
    try {
      const parentDir = import_path.default.dirname(GLOBAL_PLAYLIST_STORAGE_FILE);
      if (!import_fs.default.existsSync(parentDir)) {
        import_fs.default.mkdirSync(parentDir, { recursive: true });
      }
      import_fs.default.writeFileSync(GLOBAL_PLAYLIST_STORAGE_FILE, JSON.stringify(dataMap, null, 2), "utf-8");
    } catch (e) {
      console.warn("[SERVER RADIO] Could not write global playlist file:", e);
    }
  }
  async function getPlaylistCache(playlistId) {
    if (playlistMemoryCache.has(playlistId)) {
      return playlistMemoryCache.get(playlistId) || [];
    }
    const fileData = readGlobalPlaylistFile();
    if (fileData[playlistId] && Array.isArray(fileData[playlistId]) && fileData[playlistId].length > 0) {
      console.info(`[SERVER RADIO] Loaded ${fileData[playlistId].length} tracks for playlist ${playlistId} from global file storage bucket.`);
      playlistMemoryCache.set(playlistId, fileData[playlistId]);
      return fileData[playlistId];
    }
    const supabase = getSupabaseService();
    if (supabase) {
      try {
        const dbKey = `playlist_cache_${playlistId}`;
        const { data } = await supabase.from("nexus_notifications").select("data").eq("id", dbKey).maybeSingle();
        if (data && Array.isArray(data.data) && data.data.length > 0) {
          console.info(`[SERVER RADIO] Recovered ${data.data.length} tracks for playlist ${playlistId} from database.`);
          playlistMemoryCache.set(playlistId, data.data);
          fileData[playlistId] = data.data;
          writeGlobalPlaylistFile(fileData);
          return data.data;
        }
      } catch (err) {
        console.warn(`[SERVER RADIO WARNING] Failed to read playlist cache from DB:`, err.message);
      }
    }
    return [];
  }
  async function savePlaylistCache(playlistId, tracks) {
    playlistMemoryCache.set(playlistId, tracks);
    const fileData = readGlobalPlaylistFile();
    fileData[playlistId] = tracks;
    writeGlobalPlaylistFile(fileData);
    const supabase = getSupabaseService();
    if (supabase) {
      try {
        const dbKey = `playlist_cache_${playlistId}`;
        await supabase.from("nexus_notifications").upsert({
          id: dbKey,
          data: tracks,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        console.info(`[SERVER RADIO] Successfully persisted ${tracks.length} tracks for playlist ${playlistId} to global storage bucket & database.`);
      } catch (err) {
        console.warn(`[SERVER RADIO WARNING] Failed to persist playlist cache to DB:`, err.message);
      }
    }
  }
  app.get("/api/playlist/:playlistId", async (req, res) => {
    try {
      const { playlistId } = req.params;
      if (!playlistId || typeof playlistId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(playlistId)) {
        return res.status(400).json({ error: "Invalid playlist ID" });
      }
      console.info(`[SERVER RADIO] Fetching playlist feed: ${playlistId}`);
      const existingTracks = await getPlaylistCache(playlistId);
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
          if (response.status !== 500 && response.status !== 404) {
            console.warn(`[SERVER RADIO INFO] Using fallback feed for playlist ${playlistId}.`);
          }
        }
      } catch (fetchErr) {
      }
      const freshTracks = [];
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
          const thumbnailUrl = thumbMatch ? thumbMatch[1].trim() : videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
          title = title.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
          if (videoId) {
            freshTracks.push({ videoId, title, author, thumbnailUrl });
          }
        }
      }
      const mergedMap = /* @__PURE__ */ new Map();
      for (const track of freshTracks) {
        mergedMap.set(track.videoId, track);
      }
      for (const track of existingTracks) {
        if (!mergedMap.has(track.videoId)) {
          mergedMap.set(track.videoId, track);
        }
      }
      let mergedList = Array.from(mergedMap.values());
      if (mergedList.length === 0) {
        console.info(`[SERVER RADIO] No cached tracks or fresh RSS found. Seeding with default fallback catalog.`);
        const FALLBACK_PLAYLISTS = {
          "PLchMzReuuu_8PieB87bPG3rTxWogLuoMB": [
            // Brutal Death
            { videoId: "0g863f6H0lE", title: "Inhumane Harvest", author: "Cannibal Corpse", thumbnailUrl: "https://img.youtube.com/vi/0g863f6H0lE/hqdefault.jpg" },
            { videoId: "gPn6LpA8Z0A", title: "Seraphim Enslavement", author: "Suffocation", thumbnailUrl: "https://img.youtube.com/vi/gPn6LpA8Z0A/hqdefault.jpg" },
            { videoId: "sFst6n2m6W8", title: "Compulsion for Cruelty", author: "Dying Fetus", thumbnailUrl: "https://img.youtube.com/vi/sFst6n2m6W8/hqdefault.jpg" },
            { videoId: "6qG8NIn761w", title: "Cognitive Evisceration", author: "Devourment", thumbnailUrl: "https://img.youtube.com/vi/6qG8NIn761w/hqdefault.jpg" }
          ],
          "PLchMzReuuu_-fffjCRQpc5Mo50-QYzNMI": [
            // Classic Death
            { videoId: "sE08V8U3oH0", title: "Lack of Comprehension", author: "Death", thumbnailUrl: "https://img.youtube.com/vi/sE08V8U3oH0/hqdefault.jpg" },
            { videoId: "6X3ZOf3L61c", title: "Rapture", author: "Morbid Angel", thumbnailUrl: "https://img.youtube.com/vi/6X3ZOf3L61c/hqdefault.jpg" },
            { videoId: "4qgN-6_K2w8", title: "Slowly We Rot", author: "Obituary", thumbnailUrl: "https://img.youtube.com/vi/4qgN-6_K2w8/hqdefault.jpg" },
            { videoId: "fB37S_o0Bxs", title: "Left Hand Path", author: "Entombed", thumbnailUrl: "https://img.youtube.com/vi/fB37S_o0Bxs/hqdefault.jpg" }
          ],
          "PLBWvM6w9IQeR1uy-3_eIf2g8fHFccXWzZ": [
            // Tech Death
            { videoId: "s7oZ4xV_f_k", title: "Drone Corpse Aviator", author: "Archspire", thumbnailUrl: "https://img.youtube.com/vi/s7oZ4xV_f_k/hqdefault.jpg" },
            { videoId: "e_K6_q_K80o", title: "Stabwound", author: "Necrophagist", thumbnailUrl: "https://img.youtube.com/vi/e_K6_q_K80o/hqdefault.jpg" },
            { videoId: "v8-S1pW_Fk8", title: "Septuagint", author: "Obscura", thumbnailUrl: "https://img.youtube.com/vi/v8-S1pW_Fk8/hqdefault.jpg" },
            { videoId: "tK8f7sP_m8E", title: "Omnipresent Perception", author: "Beyond Creation", thumbnailUrl: "https://img.youtube.com/vi/tK8f7sP_m8E/hqdefault.jpg" }
          ],
          "PLchMzReuuu_9bhcmdqiiwZjzR4TL0Lt1r": [
            // Goregrind
            { videoId: "b7f0Y8k_p0U", title: "Genital Grinder", author: "Carcass", thumbnailUrl: "https://img.youtube.com/vi/b7f0Y8k_p0U/hqdefault.jpg" },
            { videoId: "8p_FkS9F0l8", title: "A Divine Proclamation of Degeneration", author: "Last Days of Humanity", thumbnailUrl: "https://img.youtube.com/vi/8p_FkS9F0l8/hqdefault.jpg" },
            { videoId: "t8f_Z8f_k8U", title: "Bleeding Heap of Flesh", author: "Regurgitate", thumbnailUrl: "https://img.youtube.com/vi/t8f_Z8f_k8U/hqdefault.jpg" }
          ],
          "PLchMzReuuu__jJpKhyYVGfavwrgHBdtK2": [
            // Grindcore
            { videoId: "K7oZ7f_N7k0", title: "You Suffer", author: "Napalm Death", thumbnailUrl: "https://img.youtube.com/vi/K7oZ7f_N7k0/hqdefault.jpg" },
            { videoId: "8t8P_Y7l0U8", title: "Piss Angel", author: "Pig Destroyer", thumbnailUrl: "https://img.youtube.com/vi/8t8P_Y7l0U8/hqdefault.jpg" },
            { videoId: "t7P_Z7f_X80", title: "Wrath", author: "Nasum", thumbnailUrl: "https://img.youtube.com/vi/t7P_Z7f_X80/hqdefault.jpg" },
            { videoId: "v8FkP_Y7lE0", title: "Dead Shall Rise", author: "Terrorizer", thumbnailUrl: "https://img.youtube.com/vi/v8FkP_Y7lE0/hqdefault.jpg" }
          ],
          "PLchMzReuuu_8av4RYcuW8rptIqmr0kSHS": [
            // Blackened Death
            { videoId: "8f7kP_Y7l0U", title: "Blow Your Trumpets Gabriel", author: "Behemoth", thumbnailUrl: "https://img.youtube.com/vi/8f7kP_Y7l0U/hqdefault.jpg" },
            { videoId: "f7kP_Z7l_E0", title: "Virtus Asinaria", author: "Belphegor", thumbnailUrl: "https://img.youtube.com/vi/f7kP_Z7l_E0/hqdefault.jpg" },
            { videoId: "v7kP_Y7l_k8", title: "Sovereign Sanctity", author: "Hate", thumbnailUrl: "https://img.youtube.com/vi/v7kP_Y7l_k8/hqdefault.jpg" }
          ],
          "PLchMzReuuu_8tMyh0UKsCasYz6BlbKGmW": [
            // Black Metal
            { videoId: "8f_P_Y7l0U8", title: "Freezing Moon", author: "Mayhem", thumbnailUrl: "https://img.youtube.com/vi/8f_P_Y7l0U8/hqdefault.jpg" },
            { videoId: "f7_P_Z7l_E0", title: "Transilvanian Hunger", author: "Darkthrone", thumbnailUrl: "https://img.youtube.com/vi/f7_P_Z7l_E0/hqdefault.jpg" },
            { videoId: "v7_P_Y7l_k8", title: "I Am the Black Wizards", author: "Emperor", thumbnailUrl: "https://img.youtube.com/vi/v7_P_Y7l_k8/hqdefault.jpg" }
          ],
          "PLchMzReuuu_8X8-o1wN3VkESLti7TLAMV": [
            // Thrash Metal
            { videoId: "8f_P_Y7l0U9", title: "Raining Blood", author: "Slayer", thumbnailUrl: "https://img.youtube.com/vi/8f_P_Y7l0U9/hqdefault.jpg" },
            { videoId: "f7_P_Z7l_E9", title: "Master of Puppets", author: "Metallica", thumbnailUrl: "https://img.youtube.com/vi/f7_P_Z7l_E9/hqdefault.jpg" },
            { videoId: "v7_P_Y7l_k9", title: "Holy Wars... The Punishment Due", author: "Megadeth", thumbnailUrl: "https://img.youtube.com/vi/v7_P_Y7l_k9/hqdefault.jpg" }
          ],
          "PLchMzReuuu_8FppUXuwggPW9e86Jn6vFu": [
            // Lyric Videos
            { videoId: "s7oZ4xV_f_k", title: "Drone Corpse Aviator (Lyric Video)", author: "Archspire", thumbnailUrl: "https://img.youtube.com/vi/s7oZ4xV_f_k/hqdefault.jpg" },
            { videoId: "0g863f6H0lE", title: "Inhumane Harvest (Lyric Video)", author: "Cannibal Corpse", thumbnailUrl: "https://img.youtube.com/vi/0g863f6H0lE/hqdefault.jpg" }
          ]
        };
        mergedList = FALLBACK_PLAYLISTS[playlistId] || [
          { videoId: "s7oZ4xV_f_k", title: "Metal Scene Radio Track 1", author: "Metal Artist", thumbnailUrl: "https://img.youtube.com/vi/s7oZ4xV_f_k/hqdefault.jpg" }
        ];
      }
      const finalMergedList = mergedList.slice(0, 400);
      const unNamedTracks = finalMergedList.filter((t) => !t.title || t.title.startsWith("Track ") || t.author === "Unknown Artist").slice(0, 25);
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
          }
        })).then(() => {
          savePlaylistCache(playlistId, finalMergedList).catch(() => {
          });
        });
      }
      await savePlaylistCache(playlistId, finalMergedList);
      console.info(`[SERVER RADIO SUCCESS] Returning ${finalMergedList.length} aggregated/cached tracks for playlist: ${playlistId}`);
      res.json({ videos: finalMergedList });
    } catch (err) {
      console.error("[PLAYLIST ENDPOINT ERROR]", err);
      res.status(500).json({ error: err.message || "Failed to fetch playlist" });
    }
  });
  app.post("/api/playlist/:playlistId/tracks", import_express.default.json(), async (req, res) => {
    try {
      const { playlistId } = req.params;
      const { tracks } = req.body;
      if (!playlistId || typeof playlistId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(playlistId)) {
        return res.status(400).json({ error: "Invalid playlist ID" });
      }
      const inputTracks = Array.isArray(tracks) ? tracks : req.body.videoId ? [req.body] : [];
      if (inputTracks.length === 0) {
        return res.status(400).json({ error: "No tracks provided" });
      }
      const existingTracks = await getPlaylistCache(playlistId);
      const trackMap = /* @__PURE__ */ new Map();
      for (const t of existingTracks) {
        if (t.videoId) trackMap.set(t.videoId, t);
      }
      for (const t of inputTracks) {
        if (!t.videoId) continue;
        const current = trackMap.get(t.videoId);
        trackMap.set(t.videoId, {
          videoId: t.videoId,
          title: t.title && !t.title.startsWith("Track ") ? t.title : current?.title || t.title || `Track`,
          author: t.author && t.author !== "Unknown Artist" ? t.author : current?.author || t.author || "Unknown Artist",
          thumbnailUrl: t.thumbnailUrl || current?.thumbnailUrl || `https://img.youtube.com/vi/${t.videoId}/hqdefault.jpg`
        });
      }
      const updatedList = Array.from(trackMap.values()).slice(0, 400);
      await savePlaylistCache(playlistId, updatedList);
      res.json({ success: true, count: updatedList.length, videos: updatedList });
    } catch (err) {
      console.error("[SAVE PLAYLIST TRACKS ERROR]", err);
      res.status(500).json({ error: err.message || "Failed to save track metadata" });
    }
  });
  app.post("/api/playlist/:playlistId/enrich", import_express.default.json(), async (req, res) => {
    try {
      const { playlistId } = req.params;
      const { videoIds } = req.body;
      if (!playlistId || typeof playlistId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(playlistId)) {
        return res.status(400).json({ error: "Invalid playlist ID" });
      }
      if (!Array.isArray(videoIds) || videoIds.length === 0) {
        return res.status(400).json({ error: "videoIds must be a non-empty array" });
      }
      const existingTracks = await getPlaylistCache(playlistId);
      const trackMap = /* @__PURE__ */ new Map();
      for (const t of existingTracks) {
        if (t.videoId) trackMap.set(t.videoId, t);
      }
      const idsNeedingFetch = videoIds.filter((id) => {
        const existing = trackMap.get(id);
        return !existing || !existing.title || existing.title.startsWith("Track ") || existing.author === "Unknown Artist";
      }).slice(0, 30);
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
          }
        }));
      }
      const enrichedList = videoIds.map((vId, idx) => {
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
    } catch (err) {
      console.error("[ENRICH PLAYLIST ERROR]", err);
      res.status(500).json({ error: err.message || "Failed to enrich playlist tracks" });
    }
  });
  app.get("/api/auth/stripe/url", (req, res) => {
    const host = req.get("host") || "localhost:3000";
    const protocol = req.protocol || "http";
    const redirectUri = `${protocol}://${host}/auth/stripe/callback`;
    const clientId = process.env.STRIPE_CONNECT_CLIENT_ID || "ca_F9O5W2jGvFv9nF089K89L89";
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: "read_write",
      redirect_uri: redirectUri
    });
    const authUrl = `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
    res.json({ url: authUrl });
  });
  app.get(["/auth/stripe/callback", "/auth/stripe/callback/"], async (req, res) => {
    const { code } = req.query;
    let stripeUserId = "acct_stripe_oauth_fallback_" + Math.random().toString(36).substring(2, 6).toUpperCase();
    if (code) {
      try {
        const stripe = await getStripeAsync();
        if (stripe) {
          const response = await stripe.oauth.token({
            grant_type: "authorization_code",
            code
          });
          stripeUserId = response.stripe_user_id || stripeUserId;
          console.log(`[STRIPE CONNECT SUCCESS] Linked Connect account: ${stripeUserId}`);
        }
      } catch (err) {
        console.error("[STRIPE CONNECT ERROR] OAuth token exchange failed:", err);
      }
    }
    res.send(`
      <html>
        <body style="background: #090b0e; color: #fff; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="text-align: center; border: 1px solid #1f2736; padding: 24px; border-radius: 12px; background: #12151e; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
            <div style="color: #00ffcc; font-size: 24px; margin-bottom: 12px;">\u2714\uFE0F</div>
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
  app.get("/api/auth/paypal/url", (req, res) => {
    const host = req.get("host") || "localhost:3000";
    const protocol = req.protocol || "http";
    const redirectUri = `${protocol}://${host}/auth/paypal/callback`;
    const clientId = process.env.VITE_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || "AdM_mG6q4kXlH680L9f_ZqR9bK87jX08yP45zQ9aB8c7d6e5";
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      scope: "openid email profile",
      redirect_uri: redirectUri
    });
    const isSandbox = !process.env.PAYPAL_PRODUCTION;
    const authEndpoint = isSandbox ? "https://www.sandbox.paypal.com/signin/authorize" : "https://www.paypal.com/signin/authorize";
    res.json({ url: `${authEndpoint}?${params.toString()}` });
  });
  app.get(["/auth/paypal/callback", "/auth/paypal/callback/"], async (req, res) => {
    const { code } = req.query;
    let email = "sandbox_paypal_user@nexus.core";
    if (code) {
      try {
        const host = req.get("host") || "localhost:3000";
        const protocol = req.protocol || "http";
        const redirectUri = `${protocol}://${host}/auth/paypal/callback`;
        const clientId = process.env.VITE_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || "AdM_mG6q4kXlH680L9f_ZqR9bK87jX08yP45zQ9aB8c7d6e5";
        const clientSecret = process.env.PAYPAL_CLIENT_SECRET || "";
        if (clientSecret) {
          const isSandbox = !process.env.PAYPAL_PRODUCTION;
          const tokenUrl = isSandbox ? "https://api-m.sandbox.paypal.com/v1/oauth2/token" : "https://api-m.paypal.com/v1/oauth2/token";
          const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
          const params = new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri
          });
          const tokenResponse = await fetch(tokenUrl, {
            method: "POST",
            headers: {
              "Authorization": `Basic ${auth}`,
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params.toString()
          });
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;
            const userInfoUrl = isSandbox ? "https://api-m.sandbox.paypal.com/v1/identity/oauth2/userinfo?schema=openid" : "https://api-m.paypal.com/v1/identity/oauth2/userinfo?schema=openid";
            const userResponse = await fetch(userInfoUrl, {
              headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
              }
            });
            if (userResponse.ok) {
              const userData = await userResponse.json();
              email = userData.email || email;
              console.log(`[PAYPAL SUCCESS] Retrieved PayPal user email: ${email}`);
            }
          }
        }
      } catch (err) {
        console.error("[PAYPAL ERROR] Error exchanging code or retrieving user info:", err);
      }
    }
    res.send(`
      <html>
        <body style="background: #090b0e; color: #fff; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="text-align: center; border: 1px solid #1f2736; padding: 24px; border-radius: 12px; background: #12151e; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
            <div style="color: #38bdf8; font-size: 24px; margin-bottom: 12px;">\u2714\uFE0F</div>
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
      apiKeyLength: rawKey.length
    });
  });
  app.get("/api/emails/dispatch-logs", (req, res) => {
    res.json({ logs: emailLogs });
  });
  app.post("/api/emails/send-test", async (req, res) => {
    const { toEmail, fromEmail = "info@thenexuscoreapp.com" } = req.body;
    const fromLine = `Nexus Core Test <${fromEmail}>`;
    const subject = "Nexus Core - Diagnostic Email Connectivity Test";
    const host = req.headers.host;
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const appUrl = process.env.APP_URL || (host ? `${protocol}://${host}` : "http://localhost:3000");
    try {
      const resend = getResend();
      if (!resend) {
        recordEmailLog("send-test", toEmail || "", fromLine, subject, "SIMULATED", { error: "No RESEND_API_KEY config" });
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
              <div style="margin-bottom: 4px;">DISPATCH_TIME: ${(/* @__PURE__ */ new Date()).toISOString()}</div>
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
        subject,
        html: getNexusEmailWrapper(rawHtml, "Diagnostic connectivity handshake verification successful.", appUrl)
      });
      if (error) {
        console.error("Resend API Diagnostic Error returned:", error);
        recordEmailLog("send-test", toEmail, fromLine, subject, "FAILED", error);
        return res.status(400).json({ success: false, error });
      }
      recordEmailLog("send-test", toEmail, fromLine, subject, "SUCCESS", data);
      res.json({ success: true, data });
    } catch (e) {
      console.error("Resend Exception caught:", e);
      recordEmailLog("send-test", toEmail || "", fromLine, subject, "FAILED", { message: e.message, stack: e.stack });
      res.status(500).json({
        success: false,
        error: e.message || "An exception occurred while invoking the Resend client.",
        stack: e.stack
      });
    }
  });
  app.post("/api/emails/invite", async (req, res) => {
    const { email, role, inviterEmail, bandName, bandId } = req.body;
    const fromLine = "Nexus Core App <invites@thenexuscoreapp.com>";
    const subject = `You have been invited to join ${bandName || "a team"} on Nexus Core`;
    const host = req.headers.host;
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const appUrl = process.env.APP_URL || (host ? `${protocol}://${host}` : "http://localhost:3000");
    try {
      const resend = getResend();
      if (!resend) {
        recordEmailLog("invite", email || "", fromLine, subject, "SIMULATED", { error: "No RESEND_API_KEY config" });
        return res.json({ simulated: true, message: "Email simulation successful (no RESEND_API_KEY)" });
      }
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      const inviteUrl = `${process.env.APP_URL || "http://localhost:3000"}/dev/dashboard?accept_invite=1&email=${encodeURIComponent(email)}&role=${encodeURIComponent(role || "")}&band=${encodeURIComponent(bandName || "")}&band_id=${encodeURIComponent(bandId || "")}`;
      const rawHtml = `
        <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; margin-top: 0; margin-bottom: 20px; font-family: 'SFMono-Regular', Consolas, monospace; text-transform: uppercase; color: #00ffcc;">[ Crew Invite Active ]</h2>
        <p style="margin: 0 0 16px 0; color: #d4d4d8;">Hello,</p>
        <p style="margin: 0 0 20px 0; color: #d4d4d8; line-height: 1.6;">
          You have been authorized by <strong>${inviterEmail || "A team manager"}</strong> to activate an operator session. 
          You've been invited to join the <strong>${bandName || "Touring Group"}</strong> workspace as a <strong>${role || "Staff Operator"}</strong>.
        </p>

        <!-- Invite Credentials Information Card -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #171d29; border: 1px solid #232c3f; border-radius: 8px; margin-bottom: 28px; border-collapse: collapse;">
          <tr>
            <td style="padding: 18px;">
              <div style="font-size: 10px; font-weight: 800; color: #8f9cae; text-transform: uppercase; font-family: 'SFMono-Regular', Consolas, monospace; margin-bottom: 6px; letter-spacing: 1px;">// INTENDED CREW RECIPIENT</div>
              <div style="font-size: 14px; font-weight: bold; color: #ffffff; margin-bottom: 14px; font-family: sans-serif;">${email}</div>
              
              <div style="font-size: 10px; font-weight: 800; color: #8f9cae; text-transform: uppercase; font-family: 'SFMono-Regular', Consolas, monospace; margin-bottom: 4px; letter-spacing: 1px;">ROLE CONFIGURATION</div>
              <div style="font-size: 13px; font-weight: bold; color: #a855f7; font-family: sans-serif;">${role || "Team Member"}</div>
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
          If you believe you received this routing invitation in error or did not ask to collaborate with ${bandName || "this artist"}, please disregard this message safely.
        </p>
      `;
      const { data, error } = await resend.emails.send({
        from: fromLine,
        to: email,
        subject,
        html: getNexusEmailWrapper(rawHtml, `Authorized invitation to join ${bandName || "crew"} as ${role || "operator"}.`, appUrl)
      });
      if (error) {
        recordEmailLog("invite", email, fromLine, subject, "FAILED", error);
        return res.status(400).json({ error });
      }
      recordEmailLog("invite", email, fromLine, subject, "SUCCESS", data);
      res.json({ success: true, data });
    } catch (e) {
      console.error("Invite Email Error:", e);
      recordEmailLog("invite", email || "", fromLine, subject, "FAILED", { message: e.message });
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/emails/guestlist", async (req, res) => {
    const { email, guestName, bandName, showDate, venueName, passType = "General", additionalCount = 0 } = req.body;
    const fromLine = "Nexus Core App <guestlist@thenexuscoreapp.com>";
    const subject = `Your Guestlist Pass for ${bandName || "the show"}`;
    const host = req.headers.host;
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const appUrl = process.env.APP_URL || (host ? `${protocol}://${host}` : "http://localhost:3000");
    let displayPassType = "General Guest Entry Pass";
    if (passType.toLowerCase() === "vip") {
      displayPassType = "VIP Access Pass";
    } else if (passType.toLowerCase() === "crew") {
      displayPassType = "Crew Member All-Access";
    } else if (passType.toLowerCase() === "media" || passType.toLowerCase() === "press") {
      displayPassType = "Media & Press Credential";
    }
    const headcountText = additionalCount > 0 ? `${displayPassType} (+${additionalCount} Additional Guests)` : `${displayPassType} (1x)`;
    const confirmationUrl = `${appUrl}/?guest_confirm=1&email=${encodeURIComponent(email || "")}&guestName=${encodeURIComponent(guestName || "")}&band=${encodeURIComponent(bandName || "")}&date=${encodeURIComponent(showDate || "")}&venue=${encodeURIComponent(venueName || "")}&pass_type=${encodeURIComponent(passType)}`;
    try {
      const resend = getResend();
      if (!resend) {
        recordEmailLog("guestlist", email || "", fromLine, subject, "SIMULATED", { error: "No RESEND_API_KEY config" });
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
        <p style="margin: 0 0 16px 0; color: #d4d4d8; text-align: center;">Hello <strong>${guestName || "VIP Guest"}</strong>,</p>
        <p style="margin: 0 0 24px 0; color: #d4d4d8; line-height: 1.6; text-align: center;">
          Your credential access has been processed successfully. You are officially listed on the exclusive artist guestlist for <strong>${bandName || "the concert"}</strong>. See confirmation details below:
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
                ` : ""}
                ${showDate ? `
                <tr>
                  <td style="padding-bottom: 12px; font-family: sans-serif; text-align: center;" align="center">
                    <div style="font-size: 10px; font-weight: 800; color: #8f9cae; text-transform: uppercase; font-family: 'SFMono-Regular', Consolas, monospace; letter-spacing: 1px; text-align: center;">EVENT DATE</div>
                    <div style="font-size: 14px; font-weight: bold; color: #ffffff; margin-top: 3px; text-align: center;">${showDate}</div>
                  </td>
                </tr>
                ` : ""}
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
        subject,
        html: getNexusEmailWrapper(rawHtml, `Your guestlist credentials for ${bandName || "the artist"} are confirmed.`, appUrl)
      });
      if (error) {
        recordEmailLog("guestlist", email, fromLine, subject, "FAILED", error);
        return res.status(400).json({ error });
      }
      recordEmailLog("guestlist", email, fromLine, subject, "SUCCESS", data);
      res.json({ success: true, data });
    } catch (e) {
      console.error("Guestlist Email Error:", e);
      recordEmailLog("guestlist", email || "", fromLine, subject, "FAILED", { message: e.message });
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/emails/vip-loyalty", async (req, res) => {
    const { email, fanName, bandName, discountCode } = req.body;
    const fromLine = "Nexus Core App <vip@thenexuscoreapp.com>";
    const subject = `Welcome to the VIP List, ${fanName}!`;
    const host = req.headers.host;
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const appUrl = process.env.APP_URL || (host ? `${protocol}://${host}` : "http://localhost:3000");
    try {
      const resend = getResend();
      if (!resend) {
        recordEmailLog("vip-loyalty", email || "", fromLine, subject, "SIMULATED", { error: "No RESEND_API_KEY config" });
        return res.json({ simulated: true, message: "Email simulation successful (no RESEND_API_KEY)" });
      }
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      const rawHtml = `
        <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; margin-top: 0; margin-bottom: 16px; font-family: 'SFMono-Regular', Consolas, monospace; text-transform: uppercase; color: #00ffcc;">[ VIP Fan Club Welcome ]</h2>
        <p style="margin: 0 0 16px 0; color: #d4d4d8;">Hey <strong>${fanName}</strong>,</p>
        <p style="margin: 0 0 24px 0; color: #d4d4d8; line-height: 1.6;">
          You are officially registered and approved on the exclusive VIP roster update for <strong>${bandName || "our touring group"}</strong>! We are deeply grateful for your loyalty and support.
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
                ${discountCode || "VIP10OFF"}
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
        subject,
        html: getNexusEmailWrapper(rawHtml, `Welcome to the exclusive VIP List for ${bandName || "our crew"}!`, appUrl)
      });
      if (error) {
        recordEmailLog("vip-loyalty", email, fromLine, subject, "FAILED", error);
        return res.status(400).json({ error });
      }
      recordEmailLog("vip-loyalty", email, fromLine, subject, "SUCCESS", data);
      res.json({ success: true, data });
    } catch (e) {
      console.error("VIP Email Error:", e);
      recordEmailLog("vip-loyalty", email || "", fromLine, subject, "FAILED", { message: e.message });
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/payments/create-escrow-intent", async (req, res) => {
    try {
      const { amount, currency = "usd", connectAccountId } = req.body;
      const stripe = await getStripeAsync();
      if (!stripe) {
        return res.status(500).json({ error: "Stripe is not configured on the server." });
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        // Stripe expects cents
        currency,
        // Optional: transferring a portion to a connected Creative Account directly
        // transfer_data: connectAccountId ? { destination: connectAccountId } : undefined,
        // For escrow, we might capture later:
        capture_method: "manual"
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/payments/create-connect-account", async (req, res) => {
    try {
      const stripe = await getStripeAsync();
      if (!stripe) {
        return res.status(500).json({ error: "Stripe is not configured." });
      }
      const account = await stripe.accounts.create({
        type: "express"
        // Express allows Stripe to handle onboarding UI
      });
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${req.protocol}://${req.get("host")}/dev/dashboard?connect_fail=1`,
        return_url: `${req.protocol}://${req.get("host")}/dev/dashboard?connect_success=1`,
        type: "account_onboarding"
      });
      res.json({ url: accountLink.url, accountId: account.id });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });
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
      const amountInCents = Math.round(amount * 100);
      const feeInCents = Math.round(amountInCents * 0.0777);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        // Stripe expects cents
        currency: "usd",
        payment_method: "pm_card_visa",
        // Use test card to bypass platform balance errors in test mode
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never"
        },
        transfer_data: {
          destination: connectAccountId
        },
        application_fee_amount: feeInCents,
        description: "Simulated Escrow Release from Platform Client"
      });
      res.json({ success: true, transferId: paymentIntent.id });
    } catch (e) {
      console.error("Escrow Release Error:", e);
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/payments/create-billing-checkout", async (req, res) => {
    try {
      const { tierId, billingCycle = "monthly", role = "band", stripeCustomerId, stripeAccountId, email } = req.body;
      const stripe = await getStripeAsync();
      const tier = (tierId || req.body.tier || "band_pro").toLowerCase();
      const interval = (billingCycle || req.body.interval || "monthly").toLowerCase();
      let vaultKey = "";
      switch (tier) {
        case "band_pro":
        case "touring_pro":
          vaultKey = interval === "yearly" || interval === "annual" || interval === "year" ? "PRICE_ID_BAND_PRO_YEARLY" : "PRICE_ID_BAND_PRO_MONTHLY";
          break;
        case "band_plus":
        case "touring_pro_plus":
        case "band_pro_plus":
          vaultKey = interval === "yearly" || interval === "annual" || interval === "year" ? "PRICE_ID_BAND_PLUS_YEARLY" : "PRICE_ID_BAND_PLUS_MONTHLY";
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
      const getTierInfo = (tId, cycle) => {
        switch (tId) {
          case "per_show":
            return { name: "Per Show Flat Pass", amount: 599 };
          case "per_tour":
            return { name: "Per Tour Flat Pass", amount: 4999 };
          case "touring_pro":
          case "band_pro":
            return cycle === "annual" || cycle === "yearly" ? { name: "Touring Pro (Annual)", amount: 18230 } : { name: "Touring Pro (Monthly)", amount: 1899 };
          case "touring_pro_plus":
          case "band_pro_plus":
          case "band_plus":
            return cycle === "annual" || cycle === "yearly" ? { name: "Touring Pro + (Annual)", amount: 28790 } : { name: "Touring Pro + (Monthly)", amount: 2999 };
          case "power_user":
          case "promoter_power":
            return cycle === "annual" || cycle === "yearly" ? { name: "Power User (Annual)", amount: 85440 } : { name: "Power User (Monthly)", amount: 8900 };
          case "enterprise_circuit":
          case "promoter_enterprise":
            return cycle === "annual" || cycle === "yearly" ? { name: "Enterprise Circuit (Annual)", amount: 239040 } : { name: "Enterprise Circuit (Monthly)", amount: 24900 };
          default:
            return { name: "Standard Subscription", amount: 1e3 };
        }
      };
      const tierInfo = getTierInfo(tier, interval);
      const isFlat = tier === "per_show" || tier === "per_tour";
      const mode = isFlat ? "payment" : "subscription";
      const host = req.get("host") || "localhost:3000";
      const protocol = req.protocol || "http";
      const redirectUrl = `${protocol}://${host}/dev/dashboard`;
      if (!stripe) {
        const mockSessionId = `cs_test_${Math.random().toString(36).substring(2, 10)}`;
        return res.json({
          url: `${redirectUrl}?mock_checkout_success=1&session_id=${mockSessionId}&tierId=${tier}&cycle=${interval}`,
          id: mockSessionId,
          simulated: true
        });
      }
      const priceId = await getVaultSecret(vaultKey);
      let session;
      if (priceId) {
        console.log(`[VAULT] Resolved dynamic price credentials: "${vaultKey}" -> "${priceId}"`);
        const sessionPayload = {
          payment_method_types: ["card"],
          line_items: [
            {
              price: priceId,
              quantity: 1
            }
          ],
          mode,
          success_url: `${redirectUrl}?checkout_success=1&session_id={CHECKOUT_SESSION_ID}&tierId=${tier}&cycle=${interval}`,
          cancel_url: `${redirectUrl}?checkout_cancel=1`,
          metadata: {
            tierId: tier,
            billingCycle: interval,
            email: email || ""
          }
        };
        if (stripeCustomerId && stripeCustomerId.startsWith("cus_") && !stripeCustomerId.includes("mock")) {
          sessionPayload.customer = stripeCustomerId;
        } else if (email) {
          sessionPayload.customer_email = email;
        }
        const sessionOptions = stripeAccountId && stripeAccountId.startsWith("acct_") ? { stripeAccount: stripeAccountId } : void 0;
        try {
          session = await stripe.checkout.sessions.create(sessionPayload, sessionOptions);
        } catch (stripeErr) {
          console.log(`[STRIPE] Primary price ID creation deferred (Reason: ${stripeErr.message}). Attempting design fallback with dynamic price data...`);
        }
      }
      if (!session) {
        try {
          const fallbackPayload = {
            payment_method_types: ["card"],
            line_items: [
              {
                price_data: {
                  currency: "usd",
                  product_data: {
                    name: tierInfo.name,
                    description: `Nexus Core - Premium Tier: ${tierInfo.name}`
                  },
                  unit_amount: tierInfo.amount,
                  recurring: mode === "subscription" ? { interval: interval === "annual" || interval === "yearly" ? "year" : "month" } : void 0
                },
                quantity: 1
              }
            ],
            mode,
            success_url: `${redirectUrl}?checkout_success=1&session_id={CHECKOUT_SESSION_ID}&tierId=${tier}&cycle=${interval}`,
            cancel_url: `${redirectUrl}?checkout_cancel=1`,
            metadata: {
              tierId: tier,
              billingCycle: interval,
              email: email || ""
            }
          };
          if (stripeCustomerId && stripeCustomerId.startsWith("cus_") && !stripeCustomerId.includes("mock")) {
            fallbackPayload.customer = stripeCustomerId;
          } else if (email) {
            fallbackPayload.customer_email = email;
          }
          const sessionOptions = stripeAccountId && stripeAccountId.startsWith("acct_") ? { stripeAccount: stripeAccountId } : void 0;
          session = await stripe.checkout.sessions.create(fallbackPayload, sessionOptions);
        } catch (fallbackErr) {
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
    } catch (e) {
      console.error("Billing Checkout Session Error:", e);
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/checkout/create-intent", async (req, res) => {
    try {
      const { amount, currency = "usd", merchantId } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }
      const stripe = await getStripeAsync();
      if (!stripe) {
        return res.json({ clientSecret: `pi_mock_secret_${Date.now()}`, simulated: true });
      }
      const amountInCents = Math.round(amount * 100);
      const feeInCents = Math.round(amountInCents * 0.0777);
      const paymentIntentParams = {
        amount: amountInCents,
        currency
      };
      if (merchantId && typeof merchantId === "string" && merchantId.startsWith("acct_")) {
        paymentIntentParams.transfer_data = { destination: merchantId };
        paymentIntentParams.application_fee_amount = feeInCents;
      }
      try {
        const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
        return res.json({ clientSecret: paymentIntent.client_secret, simulated: false });
      } catch (intentErr) {
        console.warn("[STRIPE INTENT FALLBACK]", intentErr.message);
        return res.json({ clientSecret: `pi_mock_secret_${Date.now()}`, simulated: true });
      }
    } catch (err) {
      console.error("[CREATE INTENT ERROR]", err);
      return res.json({ clientSecret: `pi_mock_secret_${Date.now()}`, simulated: true });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
