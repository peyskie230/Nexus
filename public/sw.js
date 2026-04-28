// public/sw.js
// Service Worker — makes the app work offline and installable

const CACHE_NAME = 'nexus-v1'
const urlsToCache = [
  '/',
  '/feed',
  '/chat',
  '/profile',
]

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache)
    })
  )
})

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // Return cached version or fetch from network
      if (response) {
        return response
      }
      return fetch(event.request).catch(function() {
        // If offline and not cached, return a simple offline page
        return new Response('You are offline. Please check your connection.', {
          headers: { 'Content-Type': 'text/plain' }
        })
      })
    })
  )
})

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName !== CACHE_NAME
        }).map(function(cacheName) {
          return caches.delete(cacheName)
        })
      )
    })
  )
})
