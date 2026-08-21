self.addEventListener('install', (event) => {
  // Forces the waiting service worker to become the active service worker immediately
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Allows normal online network requests to pass through untouched
  event.respondWith(fetch(event.request));
});