import { socialFeedStore, profileStore } from '../../../utils/indexedDB';
import { FeedItem } from '../../../data/socialFeedMockData';

export const getFeedCacheKey = (portalRole: string, userId?: string) =>
  `feed_posts_${portalRole}_${userId || 'guest'}`;

export const getProfileCacheKey = (portalRole: string, userId?: string) =>
  `nexus_${portalRole}_profile_v1_${userId || 'guest'}`;

export const getActiveProfileCacheKey = (portalRole: string, userId?: string) =>
  `active_${portalRole}_${userId || 'guest'}`;

export const getDiscoverProfilesCacheKey = (userId?: string) =>
  `discoverProfiles_${userId || 'guest'}`;

/**
 * Load cached feed items from IndexedDB
 */
export async function loadFeedCache(portalRole: string, userId?: string): Promise<FeedItem[] | null> {
  try {
    const key = getFeedCacheKey(portalRole, userId);
    const stored = await socialFeedStore.getItem<FeedItem[]>(key);
    return stored || null;
  } catch (e) {
    console.warn('Failed to load feed from IndexedDB:', e);
    return null;
  }
}

/**
 * Save feed items to IndexedDB
 */
export async function saveFeedCache(portalRole: string, feed: FeedItem[], userId?: string): Promise<void> {
  if (!feed || feed.length === 0) return;
  try {
    const key = getFeedCacheKey(portalRole, userId);
    await socialFeedStore.setItem(key, feed);
  } catch (e) {
    console.warn('Failed to save feed to IndexedDB:', e);
  }
}

/**
 * Get locally deleted post IDs from localStorage
 */
export function getDeletedPostIdsLocal(): string[] {
  try {
    const saved = localStorage.getItem('nexus_deleted_posts');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Error reading nexus_deleted_posts from localStorage:', e);
  }
  return [];
}

/**
 * Mark a post as deleted in localStorage
 */
export function addDeletedPostIdLocal(postId: string): void {
  try {
    const existing = getDeletedPostIdsLocal();
    if (!existing.includes(postId)) {
      const updated = [...existing, postId];
      localStorage.setItem('nexus_deleted_posts', JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Error saving nexus_deleted_posts to localStorage:', e);
  }
}

/**
 * Load discover profiles from IndexedDB
 */
export async function loadDiscoverProfilesCache(userId?: string): Promise<any[] | null> {
  try {
    const key = getDiscoverProfilesCacheKey(userId);
    const data = await profileStore.getItem<any[]>(key);
    return data || null;
  } catch (e) {
    console.warn('Failed to load discover profiles cache:', e);
    return null;
  }
}

/**
 * Save discover profiles to IndexedDB
 */
export async function saveDiscoverProfilesCache(profiles: any[], userId?: string): Promise<void> {
  try {
    const key = getDiscoverProfilesCacheKey(userId);
    await profileStore.setItem(key, profiles);
  } catch (e) {
    console.warn('Failed to save discover profiles cache:', e);
  }
}

/**
 * Load active profile data from IndexedDB
 */
export async function loadProfileIndexedDBCache(portalRole: string, userId?: string): Promise<any | null> {
  try {
    const key = getActiveProfileCacheKey(portalRole, userId);
    const data = await profileStore.getItem(key);
    return data || null;
  } catch (e) {
    console.warn('Failed to load active profile from IndexedDB:', e);
    return null;
  }
}

/**
 * Load profile data from localStorage
 */
export function loadProfileLocalStorageCache(portalRole: string, userId?: string): any | null {
  try {
    const key = getProfileCacheKey(portalRole, userId);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.warn('Error loading offline profile cache from localStorage:', e);
    return null;
  }
}
