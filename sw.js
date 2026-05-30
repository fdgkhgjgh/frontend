const CACHE_NAME = 'miniless-v1';
const urlsToCache = [
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/auth.js',
    '/js/config.js',
    '/js/theme-toggle.js',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // ✅ Don't intercept API calls
    if (url.hostname === 'api.mless.cc.cd') {
        return;
    }

    // ✅ Don't intercept external resources
    if (url.hostname !== 'mless.cc.cd') {
        return;
    }

    // ✅ For navigation requests, serve index.html
    if (event.request.mode === 'navigate') {
        event.respondWith(
            caches.match('/index.html')
                .then(response => response || fetch(event.request))
        );
        return;
    }

    // Cache first for static assets
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
