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
    // Only cache CSS files, pass everything else through
    if (event.request.url.includes('/css/')) {
        event.respondWith(
            caches.match(event.request)
                .then(response => response || fetch(event.request))
        );
        return;
    }
    // Everything else passes through normally
    event.respondWith(fetch(event.request));
});
