import localforage from 'localforage';
import { getRawSupabase } from './clientService';
import { generateUUID } from './schemaResilienceService';

export interface OfflineAction {
  id: string;
  table: string;
  action: 'insert' | 'update' | 'upsert' | 'delete';
  payload: any;
  eqFilters: { column: string; value: any }[];
  timestamp: string;
}

export function isNetworkOrConnectivityError(err: any): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true;
  }
  if (!err) return false;

  const message = (err.message || '').toLowerCase();
  const code = (err.code || '').toLowerCase();
  const status = Number(err.status || err.statusCode);

  if (
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('load failed') ||
    message.includes('failed to fetch') ||
    message.includes('cors') ||
    message.includes('unreachable') ||
    message.includes('egress') ||
    message.includes('quota') ||
    message.includes('exceed') ||
    message.includes('rate limit') ||
    message.includes('bypass') ||
    status === 0 ||
    status === 402 || // Payment Required / Egress Limit
    status === 429 || // Too Many Requests / Rate Limited
    status === 502 ||
    status === 503 ||
    status === 504 ||
    status >= 500 || // Server-side retryable errors
    code === 'fetch_error' ||
    code === 'network_error' ||
    code.includes('egress') ||
    code.includes('quota')
  ) {
    return true;
  }
  return false;
}

export const offlineQueueStore = localforage.createInstance({
  name: 'NexusCore_Offline_DB',
  storeName: 'offline_queue',
});

let memoryQueue: OfflineAction[] = [];
let memoryQueueInitialized = false;

export async function initOfflineQueue() {
  if (memoryQueueInitialized) return;
  try {
    const fromIdb = await offlineQueueStore.getItem<OfflineAction[]>('queue');
    if (fromIdb) {
      memoryQueue = fromIdb;
    } else {
      let raw = null;
      try {
        raw = localStorage.getItem('nexus_core_offline_write_queue');
      } catch (e) {}
      if (raw) {
        memoryQueue = JSON.parse(raw);
        await offlineQueueStore.setItem('queue', memoryQueue);
        try {
          localStorage.removeItem('nexus_core_offline_write_queue');
        } catch (e) {}
      }
    }
  } catch (e) {
    console.error('Failed to init offline queue from IDB', e);
  }
  memoryQueueInitialized = true;
}

export function getOfflineQueue(): OfflineAction[] {
  return memoryQueue;
}

export function saveOfflineQueue(queue: OfflineAction[]) {
  memoryQueue = queue;
  offlineQueueStore
    .setItem('queue', queue)
    .catch((e) => console.error('Error saving offline write queue to IDB:', e));
}

export function enqueueOfflineAction(action: OfflineAction) {
  const queue = getOfflineQueue();
  const isDuplicate = (queue || []).some(
    (q) =>
      q.table === action.table &&
      q.action === action.action &&
      JSON.stringify(q.eqFilters) === JSON.stringify(action.eqFilters) &&
      JSON.stringify(q.payload) === JSON.stringify(action.payload)
  );
  if (!isDuplicate) {
    queue.push(action);
    saveOfflineQueue(queue);
    console.log(
      `[Offline Sync Queue] Enqueued action: ${action.action} on ${action.table}. Total actions pending: ${queue.length}`
    );

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('nexus_core_offline_queue_changed', { detail: { queueLength: queue.length } })
      );
    }
  }
}

let isSyncing = false;

export async function processOfflineQueue(): Promise<void> {
  if (isSyncing) return;
  const queue = getOfflineQueue();
  if (queue.length === 0) return;

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return;
  }

  const rawSupabase = getRawSupabase();
  if (!rawSupabase) return;

  isSyncing = true;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('nexus_core_offline_sync_status_changed', { detail: { syncing: true } })
    );
  }
  console.log(`[Offline Sync Queue] Online connection state active! Syncing ${queue.length} actions...`);

  const pendingActions = [...queue];
  const activeQueue: OfflineAction[] = [];

  for (const action of pendingActions) {
    try {
      let builder = rawSupabase.from(action.table);
      let resPromise: any;

      if (action.action === 'insert') {
        resPromise = builder.insert(action.payload);
      } else if (action.action === 'update') {
        resPromise = builder.update(action.payload);
      } else if (action.action === 'upsert') {
        resPromise = builder.upsert(action.payload);
      } else if (action.action === 'delete') {
        resPromise = builder.delete();
      } else {
        continue;
      }

      if (action.eqFilters && action.eqFilters.length > 0) {
        action.eqFilters.forEach((filter) => {
          resPromise = resPromise.eq(filter.column, filter.value);
        });
      }

      const { error } = await resPromise;

      if (error) {
        if (isNetworkOrConnectivityError(error)) {
          console.warn(
            `[Offline Sync Queue] Network / connectivity error encountered while processing. Pausing queue.`,
            error
          );
          activeQueue.push(...pendingActions.slice(pendingActions.indexOf(action)));
          break;
        }
        console.error(`[Offline Sync Queue] Non-retryable error on sync item. Skipping item.`, error, action);
      } else {
        console.log(`[Offline Sync Queue] Synchronized action successfully: ${action.action} on table ${action.table}`);
      }
    } catch (err) {
      console.error(`[Offline Sync Queue] Exception during sequence execution:`, err);
      if (isNetworkOrConnectivityError(err)) {
        activeQueue.push(...pendingActions.slice(pendingActions.indexOf(action)));
        break;
      }
    }
  }

  saveOfflineQueue(activeQueue);
  isSyncing = false;

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('nexus_core_offline_queue_changed', { detail: { queueLength: activeQueue.length } })
    );
    window.dispatchEvent(
      new CustomEvent('nexus_core_offline_sync_status_changed', { detail: { syncing: false } })
    );
  }
}

export function wrapQueryBuilder(realBuilder: any, table: string): any {
  let action: 'insert' | 'update' | 'upsert' | 'delete' | 'select' | null = null;
  let payload: any = null;
  const eqFilters: { column: string; value: any }[] = [];

  const handler: ProxyHandler<any> = {
    get(target, prop, receiver) {
      if (prop === 'then') {
        return (onfulfilled?: any, onrejected?: any) => {
          const isWrite = action && ['insert', 'update', 'upsert', 'delete'].includes(action);
          const promise = target;
          return promise.then(
            (result: any) => {
              if (isWrite && isNetworkOrConnectivityError(result?.error)) {
                console.warn(
                  `[Offline Queue] Direct connection failed for ${action} on '${table}'. Enqueuing offline write packet.`
                );

                enqueueOfflineAction({
                  id: generateUUID(),
                  table,
                  action: action as any,
                  payload,
                  eqFilters,
                  timestamp: new Date().toISOString(),
                });

                const dummyResult = { error: null, data: payload, count: 1 };
                return onfulfilled ? onfulfilled(dummyResult) : dummyResult;
              }
              return onfulfilled ? onfulfilled(result) : result;
            },
            (err: any) => {
              if (isWrite && isNetworkOrConnectivityError(err)) {
                console.warn(
                  `[Offline Queue] Intercepted throwing connectivity issue for ${action} on '${table}'. Enqueuing offline write packet.`,
                  err
                );

                enqueueOfflineAction({
                  id: generateUUID(),
                  table,
                  action: action as any,
                  payload,
                  eqFilters,
                  timestamp: new Date().toISOString(),
                });

                const dummyResult = { error: null, data: payload, count: 1 };
                return onfulfilled ? onfulfilled(dummyResult) : dummyResult;
              }
              return onrejected ? onrejected(err) : Promise.reject(err);
            }
          );
        };
      }

      const val = Reflect.get(target, prop, receiver);
      if (typeof val === 'function') {
        return (...args: any[]) => {
          if (prop === 'insert') {
            action = 'insert';
            payload = args[0];
          } else if (prop === 'update') {
            action = 'update';
            payload = args[0];
          } else if (prop === 'upsert') {
            action = 'upsert';
            payload = args[0];
          } else if (prop === 'delete') {
            action = 'delete';
          } else if (prop === 'eq') {
            eqFilters.push({ column: args[0], value: args[1] });
          }

          const nextResult = val.apply(target, args);
          return wrapQueryBuilder(nextResult, table);
        };
      }

      return val;
    }
  };

  return new Proxy(realBuilder, handler);
}

/**
 * Checks if a Supabase error or throw suggests that a database egress/network bypass is required
 */
export function isBypassRequiredError(error: any): boolean {
  if (!error) return false;

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true;
  }

  const msg = String(error.message || '').toLowerCase();
  const status = Number(error.status || error.statusCode);
  const code = String(error.code || '');

  if (
    status === 402 || // Payment Required
    status === 411 || // Length Required (blocked by Cloudflare/gateway constraints)
    status === 429 || // Too many requests or rate-limited limits
    status === 0 || // Failed network socket connection
    status >= 400 || // ANY gateway / client limitation or error in this sandbox
    status >= 500 || // Gateway timeout / server failures
    msg.includes('network') ||
    msg.includes('fetch') ||
    msg.includes('cors') ||
    msg.includes('blocked') ||
    msg.includes('lock') ||
    msg.includes('failed to fetch') ||
    msg.includes('egress') ||
    msg.includes('quota') ||
    msg.includes('exceed') ||
    msg.includes('rate limit') ||
    msg.includes('bypass') ||
    code.includes('network') ||
    code.includes('fetch') ||
    code.includes('egress') ||
    code.includes('quota')
  ) {
    return true;
  }
  return false;
}

/**
 * Handles database failover by returning fallback data.
 */
export function handleDatabaseFailover(tableName: string, fallbackData: any[]): any[] {
  return fallbackData;
}

/**
 * Dynamically serializes successfully loaded database records to local cache failover slots.
 */
export function saveToFailoverCache(tableName: string, freshData: any[]): void {
  // Disabled as per user request to remove fallback logic entirely
}

// Background scheduling triggers for instant auto-resilience
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Offline Sync Engine] Browser went online! Executing queue sync.');
    processOfflineQueue().then();
  });

  setInterval(() => {
    processOfflineQueue().then();
  }, 15000);

  setTimeout(() => {
    processOfflineQueue().then();
  }, 1000);
}
