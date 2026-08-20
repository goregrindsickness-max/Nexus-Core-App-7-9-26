// Nexus Core Service Worker for Push Notifications and Handshake Core FCM
self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Nexus Core', body: event.data.text() };
    }
  }

  const title = data.title || 'Nexus Core Push Alert';
 const options = {
    body: data.body || 'New message from Nexus Core.',
    icon: '/icon-192.png',   // <-- Swapped from /favicon.ico
    badge: '/icon-192.png',  // <-- Swapped from /favicon.ico
    tag: 'nexus-core-alert',
    renotify: true,
    data: data
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // Focus or open application window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

/* ==========================================================================
   ⚠️ MANDATORY PWA LIFECYCLE HOOKS (Ensures Chrome/Android Installability)
   ========================================================================== */

self.addEventListener('install', (event) => {
  // Forces the waiting service worker to become active immediately
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Passes requests through to the live network (satisfies Chrome's offline capability rule)
  event.respondWith(fetch(event.request));
});