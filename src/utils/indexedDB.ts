import localforage from 'localforage';

localforage.config({
  name: 'NexusCore_Offline_DB',
});

export const inventoryStore = localforage.createInstance({
  name: 'NexusCore_Offline_DB',
  storeName: 'inventory_store'
});

export const posSalesStore = localforage.createInstance({
  name: 'NexusCore_Offline_DB',
  storeName: 'pos_sales_store'
});

export const itinerariesStore = localforage.createInstance({
  name: 'NexusCore_Offline_DB',
  storeName: 'itineraries_store'
});

export const socialFeedStore = localforage.createInstance({
  name: 'NexusCore_Offline_DB',
  storeName: 'social_feed_store'
});

export const reviewsStore = localforage.createInstance({
  name: 'NexusCore_Offline_DB',
  storeName: 'reviews_store'
});

export const showsStore = localforage.createInstance({
  name: 'NexusCore_Offline_DB',
  storeName: 'shows_store'
});

export const venuesStore = localforage.createInstance({
  name: 'NexusCore_Offline_DB',
  storeName: 'venues_store'
});

export const offersStore = localforage.createInstance({
  name: 'NexusCore_Offline_DB',
  storeName: 'offers_store'
});

export const routingBeaconsStore = localforage.createInstance({
  name: 'NexusCore_Offline_DB',
  storeName: 'routing_beacons_store'
});

export const creativeNodesStore = localforage.createInstance({
  name: 'NexusCore_Offline_DB',
  storeName: 'creative_nodes_store'
});

export const expensesStore = localforage.createInstance({
  name: 'NexusCore_Offline_DB',
  storeName: 'expenses_store'
});

export const registrationStagingStore = localforage.createInstance({
  name: 'NexusCore_Offline_DB',
  storeName: 'registration_staging'
});

export const labelCatalogStore = localforage.createInstance({
  name: 'NexusCore_Offline_DB',
  storeName: 'label_catalog_store'
});

export const profileStore = localforage.createInstance({
  name: 'NexusCore_Offline_DB',
  storeName: 'profile_store'
});


