// Service Worker for AI Text Detector
const CACHE_NAME = 'ai-text-detector-v1';
const BASE_PATH = '/ai-text-detector';
const ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/css/styles.css`,
  `${BASE_PATH}/dist/bundle.js`,
  `${BASE_PATH}/assets/favicon.ico`,
  // Add other static assets to cache
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app assets');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper to determine if a request URL should be cached
function shouldCache(url) {
  const parsedUrl = new URL(url);
  
  // Cache requests to our domain
  if (parsedUrl.origin === location.origin) {
    return true;
  }
  
  // Add any external resources that should be cached
  const externalUrlsToCache = [
    'https://fonts.googleapis.com',
    'https://cdn.jsdelivr.net'
  ];
  
  return externalUrlsToCache.some(externalUrl => 
    parsedUrl.href.startsWith(externalUrl)
  );
}

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Handle GitHub Pages base path
  let requestUrl = event.request.url;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Clone the request - request can only be used once
        const fetchRequest = event.request.clone();
        
        // Make network request
        return fetch(fetchRequest)
          .then(response => {
            // Check if response is valid
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Only cache if it's a resource we want to cache
            if (shouldCache(requestUrl)) {
              // Clone the response - response can only be used once
              const responseToCache = response.clone();
              
              // Cache the fetched response
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
              
            return response;
          })
          .catch(() => {
            // Fallback for specific requests when offline
            if (event.request.url.includes('/api/')) {
              return new Response(JSON.stringify({ 
                error: 'You are offline. This feature requires an internet connection.' 
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
            
            // For HTML navigation requests, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match(`${BASE_PATH}/index.html`);
            }
          });
      })
  );
}); 