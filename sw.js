const CACHE_NAME = 'trishul-core-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

// Install: Cache core files immediately
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Activate: Clean up old caches to prevent bugs
self.addEventListener('activate', event => {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});

// Fetch: Stale-While-Revalidate (Fast offline load, updates in background)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then(cachedRes => {
      const fetchPromise = fetch(event.request).then(networkRes => {
        if (networkRes && networkRes.status === 200) {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkRes.clone()));
        }
        return networkRes;
      }).catch(() => cachedRes); // Fallback to cache if offline
      
      return cachedRes || fetchPromise;
    })
  );
});