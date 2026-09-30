// Madinki Service Worker (App Shell Precache Only)
// Note: Per AGENTS.md §4, data operations require network connectivity.
// This Service Worker is dedicated to PWA installability and app shell asset caching.

const CACHE_NAME = 'madinki-shell-v1';
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon.svg',
  '/icons/icon-maskable.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache Supabase API calls, auth tokens, or mutations
  if (
    url.origin.includes('supabase.co') ||
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/')
  ) {
    return;
  }

  // Network-first strategy for navigations, cache-first for static icons/manifest
  if (
    url.pathname === '/manifest.json' ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/favicon.svg'
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return (
          cached ||
          fetch(event.request).then((response) => {
            if (response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return response;
          })
        );
      })
    );
  }
});
