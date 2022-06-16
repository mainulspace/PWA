var today = new Date();
var version = today.getDate();
console.log('Today day is : ' + version);
var CACHE_STATIC_NAME = 'static-v' + version;
var CACHE_DYNAMIC_NAME = 'dynamic-v' + version;
var EXCLUDE_URL_CACHING = ['/amp', '/wp-includes', '/wp-admin', '/manifest.json', '/robots.txt', '/wp-login.php', '/service-worker.js', '/.well-known/*'];
var arrayLength = EXCLUDE_URL_CACHING.length;
var STATIC_FILES = [
    '/offline/'
];

self.addEventListener('install', function (event) {
    self.skipWaiting();
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


self.addEventListener('fetch', function(event) {
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
    console.log('Fetch from app');
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Cache hit - return response
                if (response) {
                    console.log('From cache: ' + response);
                    return response;
                }
                return fetch(event.request).then(
                    function(response) {
                        console.log('From network:' + response.status);
                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        var responseToCache = response.clone();
                        caches.open(CACHE_DYNAMIC_NAME)
                            .then(function(cache) {
                                console.info('Cached URL:', event.request.url);
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    }
                );
            }).catch(function() {
            // If both fail, show a generic fallback:
            return caches.match('/offline/');
        })
    );
});