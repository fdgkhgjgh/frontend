const CACHE_NAME = 'miniless-v2'; // ✅ change v1 to v2
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
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Don't intercept API calls or external resources
    if (url.hostname !== 'mless.cc.cd') {
        return;
    }

    // ✅ For all requests, follow redirects properly
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) return response;
                
                // ✅ Fetch with redirect follow
                return fetch(event.request.clone(), { redirect: 'follow' })
                    .then(fetchResponse => {
                        // Don't cache redirects
                        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type === 'opaqueredirect') {
                            return fetchResponse;
                        }
                        const responseToCache = fetchResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                        return fetchResponse;
                    });
            })
    );
});
