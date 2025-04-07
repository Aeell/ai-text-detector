// Service Worker for AI Text Detector
const CACHE_NAME = 'ai-detector-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/main.css',
  '/dark-theme.css',
  '/responsive.css',
  '/main.js',
  '/utils.js',
  '/debug.js',
  '/ai-detector.js',
  '/ui-controller.js',
  '/sherlock-ai-background.jpg',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(error => {
        console.error('Error caching assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Clone the request because it can only be used once
        const fetchRequest = event.request.clone();

        // Make network request and cache the response
        return fetch(fetchRequest)
          .then(response => {
            // Check if response is valid
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it can only be used once
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            // You could return a custom offline page here
            return new Response('Offline - Please check your connection');
          });
      })
  );
});

// Handle background sync for offline submissions
self.addEventListener('sync', event => {
  if (event.tag === 'analyze-text') {
    event.waitUntil(
      // Get pending analyses from IndexedDB and process them
      processOfflineAnalyses()
    );
  }
});

// Process offline analyses when back online
async function processOfflineAnalyses() {
  try {
    const db = await openDB();
    const pendingAnalyses = await db.getAll('pending');
    
    for (const analysis of pendingAnalyses) {
      try {
        // Process the analysis
        const result = await processAnalysis(analysis);
        
        // Store the result
        await db.put('results', result);
        
        // Remove from pending
        await db.delete('pending', analysis.id);
        
        // Notify the client
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'analysis-complete',
            result
          });
        });
      } catch (error) {
        console.error('Error processing offline analysis:', error);
      }
    }
  } catch (error) {
    console.error('Error handling offline analyses:', error);
  }
}

// Helper function to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AIDetectorDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains('pending')) {
        db.createObjectStore('pending', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('results')) {
        db.createObjectStore('results', { keyPath: 'id' });
      }
    };
  });
}

// Helper function to process an analysis
async function processAnalysis(analysis) {
  // Implement actual analysis logic here
  return {
    id: analysis.id,
    text: analysis.text,
    result: 'Processed offline',
    timestamp: Date.now()
  };
} 