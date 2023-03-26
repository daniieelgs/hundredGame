let version = "offline"

// self.addEventListener("install", () => {
//     console.log("installing sw");

//     createCache()
//         .then(() => console.log("data cached"))
//         .catch(console.error);

// });

// self.addEventListener("activate", () => {

//     console.log("activating sw");

//     updateCache(() => console.log("deletting old cache"));

// });

// self.addEventListener("fetch", e => {

//     console.log("fetching: " + e.request);

//     e.respondWith(async function(){

//         try{

//             const request = await fetch(e.request);

//             createCache();
//             updateCache();

//             return request;

//         }catch(e){

//             const requestCache = await caches.match(e.request);

//             if(requestCache) return requestCache;

//         }

//     });

// })

function createCache(){

    version = (new Date().getTime()) + "_" + version;

    return new Promise((resolved, reject) => {
        caches.open(version)
            .then(cache => cache.addAll(["../", "../index.html", "../css/modal.css", "../css/styles.css", "../css/tableRanking.css", "../js/api.js", "../js/indexedDB.js", "../js/main.js", "../js/modal.js", "../js/rankings.js", "../js/service_worker.js", "../js/sw.js", "../js/worker.js"]))
            .then(resolved)
            .catch(reject);
    });

}

// function updateCache(callback){

//     return new Promise((resolved, reject) => {
//         caches.keys().then(key => {
//             return Promise.all(key.map(cache => {
//                 if(cache !== version){
//                     callback(cache);
//                     return caches.delete(cache);
//                 }
//             }))
//         })
//         .then(resolved)
//         .catch(reject);
//     });

// }


self.addEventListener("install", () => {
    console.log("installing sw");

    createCache()
        .then(() => console.log("data cached"))
        .catch(console.error);

});

self.addEventListener('activate', event => {
    event.waitUntil(
      caches.keys().then(cacheNames => Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== version)
          .map(cacheName => caches.delete(cacheName))
    ))
  );
});

self.addEventListener("fetch", e => {

    e.respondWith(
        fetch(e.request)
          .then((networkResponse) => {
            return caches.open(version).then((cache) => {
              cache.put(e.request, networkResponse.clone());
              return networkResponse;
            })
          })
          .catch(() => {
            return caches.match(e.request);
          })
      )

    
});