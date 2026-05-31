// Minimal service worker - no caching to avoid redirect issues
self.addEventListener('fetch', event => {
    // Just pass through all requests without intercepting
    event.respondWith(fetch(event.request));
});
