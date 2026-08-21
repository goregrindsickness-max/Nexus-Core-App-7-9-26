import fs from 'fs';

let content = fs.readFileSync('src/supabase.ts', 'utf8');

// Replace local storage with localforage for the offline queue
const newQueueLogic = `
import localforage from 'localforage';
export const offlineQueueStore = localforage.createInstance({
  name: 'NexusCore_Offline_DB',
  storeName: 'offline_queue'
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
      const raw = localStorage.getItem('nexus_core_offline_write_queue');
      if (raw) {
        memoryQueue = JSON.parse(raw);
        await offlineQueueStore.setItem('queue', memoryQueue);
        localStorage.removeItem('nexus_core_offline_write_queue');
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
  offlineQueueStore.setItem('queue', queue).catch(e => console.error('Error saving offline write queue to IDB:', e));
}
`;

content = content.replace(
  /export function getOfflineQueue\(\): OfflineAction\[\] \{[\s\S]*?export function saveOfflineQueue\(queue: OfflineAction\[\]\) \{[\s\S]*?  \}\n\}/,
  newQueueLogic.trim()
);

fs.writeFileSync('src/supabase.ts', content);
console.log('Updated supabase.ts queue logic');
