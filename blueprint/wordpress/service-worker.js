var CACHE_VERSION = new URL(location).searchParams.get('VER');
var CACHE_STATIC_NAME = 'static-v' + CACHE_VERSION;
var CACHE_DYNAMIC_NAME = 'dynamic-v' + CACHE_VERSION;
var EXCLUDE_URL_CACHING = ['/amp', '/wp-includes', '/wp-admin', '/manifest.json', '/robots.txt', '/wp-login.php', '/service-worker.js', '/.well-known/*'];
var arrayLength = EXCLUDE_URL_CACHING.length;
var STATIC_FILES = [
    '/offline/'
];

self.addEventListener('install', function (event) {
    // self.skipWaiting();
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
        .then(function (cache) {
            console.log('[Service Worker] Precaching App Shell');
            cache.addAll(STATIC_FILES);
        })
    )
});

self.addEventListener('activate', function (event) {
    console.log('[Service Worker] Activating Service Worker ....', event);
    event.waitUntil(
        caches.keys()
        .then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
                    console.log('[Service Worker] Removing old cache.', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

// cache then network strategy
self.addEventListener('fetch', function (event) {

    if (!(event.request.url.indexOf('http') === 0)) {
        return;
    }

    // Doesn't cache following url
    for (var i = 0; i < arrayLength; i++) {
        if (event.request.url.indexOf(EXCLUDE_URL_CACHING[i]) !== -1) {
            return;
        }
    }

    if (event.request.method === 'POST' || event.request.method === 'PUT' || event.request.method === 'PATCH' || event.request.method === 'DELETE') {
        return;
    }

    event.respondWith(
        caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
            return cache.match(event.request).then(function (response) {
                return response || fetch(event.request).then(function (response) {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        }).catch(function (err) {
            // If both fail, show a generic fallback:
            return caches.open(CACHE_STATIC_NAME)
            .then(function (cache) {
                return cache.match('/offline/');
            })
        })
    );
});