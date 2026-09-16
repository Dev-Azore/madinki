'use client';

import { useEffect } from 'react';

/**
 * DevCacheCleaner
 * Automatically unregisters any legacy or cached Service Workers and deletes
 * Workbox / Serwist cache storages during development (localhost).
 *
 * This prevents the browser from holding on to stale CSS / JS chunks and eliminates
 * the need to continuously perform a hard refresh (Ctrl+Shift+R).
 */
export function DevCacheCleaner() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().then((unregistered) => {
              if (unregistered) {
                console.info('[TailorApp Dev] Unregistered stale service worker on localhost.');
              }
            });
          }
        });
      }

      if ('caches' in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
          }
        });
      }
    }
  }, []);

  return null;
}
