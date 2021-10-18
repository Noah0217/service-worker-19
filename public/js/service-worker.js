const DATA_CACHE_NAME = "cache-v1";
const CACHE_NAME = "cache-v2";
const FILES_TO_CACHE = [
    "/", "/index.html","index.js", "/db.js", "/style.css"];

//installing service worker
self.addEventListener("install", function(evt) {
    evt.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        console.log("Your data was pre cached successfully.");
        return cache.addAll(FILES_TO_CACHE);
      })
    );
    self.skipWaiting();
  });

  //activating service worker
  self.addEventListener("activate", function(evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Deleting old cached data.", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
    self.clients.claim();
  });

  //fetching data from cache
  self.addEventListener("fetch", evt => {
    if(evt.request.url.includes('/api/')) {
        console.log('[Service Worker] Fetch(data)', evt.request.url);
         evt.respondWith(
                caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request).then(response => {
                    if (response.status === 200){
                        cache.put(evt.request.url, response.clone());
                    }
                    return response;
                })
                .catch(err => {
                    return cache.match(evt.request);
                });
             })
            );
            return;
        }
    evt.respondWith(
        caches.match(evt.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return caches
                .open(RUNTIME_CACHE).then(cache =>
                    fetch(evt.request).then(response =>
                        cache.put(evt.request, response.clone()).then(() => response)
                    )
                );
        })
    );
});
    