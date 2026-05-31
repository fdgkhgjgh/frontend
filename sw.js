const CACHE_NAME = 'miniless-v3';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll([
            '/css/style.css',
            '/css/dark-mode.css'
        ]))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => {
            // Return empty response on network failure
            return new Response('', { status: 408 });
        })
    );
});
