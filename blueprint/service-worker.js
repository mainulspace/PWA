// ------------ CONFIGURATION ------------
const today               = new Date().toISOString().split('T')[0];
const CACHE_STATIC_NAME   = `static-${today}`;
const CACHE_DYNAMIC_NAME  = `dynamic-${today}`;

const EXCLUDE_URL_CACHING = [
    '/api/',
    '/cart',
    '/checkout',
    '/login',
    '/manifest.json',
    '/robots.txt',
    '/service-worker.js'
];

// Your “app shell” – update with your actual files
const STATIC_FILES = [
    '/',
    '/offline.php',
    '/styles/main.css',
    '/scripts/app.js',
    '/pwa-images/icons/app-icon-192x192.png'
];

// ------------ INSTALL ------------
self.addEventListener('install', event => {
    console.log('[SW] Installing…');
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(cache => cache.addAll(STATIC_FILES))
    );
});

// ------------ ACTIVATE ------------
self.addEventListener('activate', event => {
    console.log('[SW] Activating…');
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME)
                    .map(oldKey => caches.delete(oldKey))
            )
        )
    );
    return self.clients.claim();
});

// ------------ FETCH ------------
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = request.url;

    // Only handle GET over HTTP(s)
    if (request.method !== 'GET' || !url.startsWith('http')) return;

    // Skip excluded URLs
    if (EXCLUDE_URL_CACHING.some(pattern => url.includes(pattern))) return;

    // Stale-while-revalidate for your app shell
    if (STATIC_FILES.some(path => url.endsWith(path))) {
        event.respondWith(
            caches.open(CACHE_STATIC_NAME).then(cache =>
                cache.match(request).then(cached => {
                    const networkFetch = fetch(request).then(networkRes => {
                        cache.put(request, networkRes.clone());
                        return networkRes;
                    });
                    return cached || networkFetch;
                })
            )
        );
        return;
    }

    // Cache-first, then network (dynamic caching)
    event.respondWith(
        caches.match(request).then(cached => {
            if (cached) {
                return cached;
            }
            return fetch(request)
                .then(networkRes => {
                    // Only cache valid, basic responses
                    if (networkRes && networkRes.status === 200 && networkRes.type === 'basic') {
                        const clone = networkRes.clone();
                        caches.open(CACHE_DYNAMIC_NAME).then(cache => {
                            cache.put(request, clone);
                        });
                    }
                    return networkRes;
                })
                .catch(() => {
                    // On navigation failure, serve fallback
                    if (request.mode === 'navigate') {
                        return caches.match('/offline.php');
                    }
                });
        })
    );
});