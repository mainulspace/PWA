
importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

var CACHE_STATIC_NAME = 'static-v25';
var CACHE_DYNAMIC_NAME = 'dynamic-16';
var STATIC_FILES = [
	'/',
	'/index.html',
	'/offline.html',
	'/src/js/app.js',
	'/src/js/feed.js',
	'/src/js/idb.js',
	'/src/js/promise.js',
	'/src/js/fetch.js',
	'/src/js/material.min.js',
	'/src/css/app.css',
	'/src/css/feed.css',
	'/src/css/help.css',
	'/src/images/main-image.jpg',
	'https://fonts.googleapis.com/css?family=Roboto:400,700',
	'https://fonts.googleapis.com/icon?family=Material+Icons',
	'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];



// function trimCache(cachName, maxItems) {
// 	caches.open(cacheName)
// 	 .then(function(cache) {
// 	 	return cache.keys()
// 	 	 .then(function(keys) {
// 		 	if(keys.length > maxItems) {
// 		 		cache.delete(keys[0])
// 		 			.then(trimCache(cacheName, maxItems));
// 		 	}
// 		 });

// 	 })
// }

self. addEventListener('install', function(event) {
	console.log('[Service Worker] Installing Service Worker ....', event);
	event.waitUntil(
		caches.open(CACHE_STATIC_NAME)
			.then(function(cache) {
				console.log('[Service Worker] Precaching App Shell....');
				cache.addAll(STATIC_FILES);
			})
	)
});

self.addEventListener('activate', function(event) {
	// console.log('[Service Worker] Activating Service Worker ....', event);
	event.waitUntil(
		caches.keys()
			.then(function(keyList) {
				return Promise.all(keyList.map(function(key){
					if(key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
						console.log('[Service Worker] Removing old cache.', key);
						return caches.delete(key);
					}
				}));
			})
	);
	return self.clients.claim();
});

function isInArray(string, array) {
	for(var i = 0; i < array.length; i++){
		if(array[i] === string) {
			return true;
		}
	}
	return false;
}


// Cache then Network with Offline Support
self.addEventListener('fetch', function (event) {

  // var url = 'https://httpbin.org/get';
  // Fetch data from firebase 
  var url = 'https://first-pwa-1f718.firebaseio.com/posts';
  if (event.request.url.indexOf(url) > -1) {
  	// Cache for new url
    // event.respondWith(
    //   caches.open(CACHE_DYNAMIC_NAME)
    //     .then(function (cache) {
    //       return fetch(event.request)
    //         .then(function (res) {
    //           // trimCache(CACHE_DYNAMIC_NAME, 3);
    //           cache.put(event.request, res.clone());
    //           return res;
    //         });
    //     })
    // );
    event.respondWith(fetch(event.request)
    	.then(function (res) {
    		var clonedRes = res.clone();
    		// re-populate the database if data delete from database
    		clearAllData('posts')
    		 .then(function() {
    		 	return clonedRes.json(); 
    		 })
    		 .then(function(data){
		 		for(var key in data) {
		 			writeData('posts', data[key]);
		 		}
    		 });
    		return res;
    	})
    );
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(
      caches.match(event.request)
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(function (response) {
          if (response) {
            return response;
          } else {
            return fetch(event.request)
              .then(function (res) {
                return caches.open(CACHE_DYNAMIC_NAME)
                  .then(function (cache) {
                  	// trimCache(CACHE_DYNAMIC_NAME, 3);
                    cache.put(event.request.url, res.clone());
                    return res;
                  })
              })
              .catch(function (err) {
                return caches.open(CACHE_STATIC_NAME)
                  .then(function (cache) {
                    // if (event.request.url.indexOf('/help')) {
                    if (event.request.headers.get('accept').includes('text/html')) {
                      return cache.match('/offline.html');
                    }
                  });
              });
          }
        })
    );
  }
});


// Cache then network strategy and dynamic caching
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.open(CACHE_DYNAMIC_NAME)
//       .then(function(cache) {
//         return fetch(event.request)
//           .then(function(res) {
//             cache.put(event.request, res.clone());
//             return res;
//           });
//       })
//   );
// });

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response) {
//         if (response) {
//           return response;
//         } else {
//           return fetch(event.request)
//             .then(function(res) {
//               return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 })
//             })
//             .catch(function(err) {
//               return caches.open(CACHE_STATIC_NAME)
//                 .then(function(cache) {
//                   return cache.match('/offline.html');
//                 });
//             });
//         }
//       })
//   );
// });

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//       .then(function(res) {
//         return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 })
//       })
//       .catch(function(err) {
//         return caches.match(event.request);
//       })
//   );
// });

// Cache-only
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     caches.match(event.request)
//   );
// });

// Network-only
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     fetch(event.request)
//   );
// });



self.addEventListener('sync', function(event) {
  console.log('[Service Worker] Background syncing', event);
  if (event.tag === 'sync-new-posts') {
    console.log('[Service Worker] Syncing new Posts');
    event.waitUntil(
      readAllData('sync-posts')
        .then(function(data) {
          for (var dt of data) {
            fetch('https://first-pwa-1f718.firebaseio.com/posts.json', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                id: dt.id,
                title: dt.title,
                location: dt.location,
                image: 'https://firebasestorage.googleapis.com/v0/b/first-pwa-1f718.appspot.com/o/sf-boat.jpg?alt=media&token=1774509c-7155-4580-b90e-312c90a79cfa'
              })
            })
              .then(function(res) {
                console.log('Sent data', res);
                if (res.ok) {
                  deleteItemFromData('sync-posts', dt.id); // Isn't working correctly!
                }
              })
              .catch(function(err) {
                console.log('Error while sending data', err);
              });
          }

        })
    );
  }
});

// self.addEventListener('notificationclick', function(event) {
//   var notification = event.notification;
//   var action = event.action;

//   console.log(notification);

//   if (action === 'confirm') {
//     console.log('Confirm was chosen');
//     notification.close();
//   } else {
//     console.log(action);
//     notification.close();
//   }
// });

// self.addEventListener('notificationclose', function(event) {
//   console.log('Notification was closed', event);
// });


self.addEventListener('notificationclick', function(event) {
  var notification = event.notification;
  var action = event.action;

  console.log(notification);

  if (action === 'confirm') {
    console.log('Confirm was chosen');
    notification.close();
  } else {
    console.log(action);
    notification.close();
  }
});

self.addEventListener('notificationclose', function(event) {
  console.log('Notification was closed', event);
});





// Fetch from dynamic cache and store in dynamic cache if not available

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.open(CACHE_DYNAMIC_NAME).then(function(cache) {
//       return cache.match(event.request).then(function (response) {
//         return response || fetch(event.request).then(function(response) {
//           if ( event.request.url.match( '^.*(\/collect\/).*$' ) ) {
//             return false;
//         }
//          // OR
    
//         if ( event.request.url.indexOf( '/gtag/' ) !== -1 ) {
//             return false;
//         }
//         //    *** rest of your service worker code ***
//           cache.put(event.request, response.clone());
//           return response;
//         });
//       });
//     })
//   );
// });


