const CACHE_NAME = 'focuspulse-ghpages-v3';
const ASSETS = [
    './',
    './index.html',
    './manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(k => {
                if (k !== CACHE_NAME) return caches.delete(k);
            })
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    // Do not cache cloud database requests or API calls
    if (url.hostname.includes('firebaseio.com') || url.pathname.includes('/api/')) {
        return;
    }

    // Network-first with cache fallback for HTML and app shell
    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (response.ok && event.request.method === 'GET') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request).then(cached => {
                    return cached || caches.match('./') || caches.match('./index.html');
                });
            })
    );
});
