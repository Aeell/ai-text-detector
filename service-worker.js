// Service Worker for AI Text Detector
const CACHE_NAME = 'ai-detector-cache-v1';
const APP_PREFIX = '/ai-text-detector';

// Dynamic cache for runtime resources
const RUNTIME_CACHE = 'ai-detector-runtime';

// Assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/dark-theme.css',
  '/css/responsive.css',
  '/images/sherlock-ai-background.jpg',
  '/favicon.ico'
];

// Function to normalize URLs
function normalizeUrl(url) {
  const baseUrl = self.location.origin;
  return url.startsWith('http') ? url : `${baseUrl}${APP_PREFIX}${url}`;
}

// Install event - cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app assets');
        const normalizedUrls = PRECACHE_ASSETS.map(url => normalizeUrl(url));
        return cache.addAll(normalizedUrls);
      })
      .catch(error => {
        console.error('Error caching assets:', error);
      })
  );
  
  // Activate worker immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys()
        .then(cacheNames => {
          return Promise.all(
            cacheNames
              .filter(cacheName => 
                cacheName.startsWith('ai-detector-') && 
                cacheName !== CACHE_NAME &&
                cacheName !== RUNTIME_CACHE
              )
              .map(cacheName => {
                console.log('Deleting old cache:', cacheName);
                return caches.delete(cacheName);
              })
          );
        }),
      // Claim clients immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - network first with cache fallback
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) return;
  
  // Handle API requests differently
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE)
            .then(cache => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // For navigation requests, return index.html
            if (event.request.mode === 'navigate') {
              return caches.match(normalizeUrl('/index.html'));
            }
            
            return new Response('Network error happened', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' },
            });
          });
      })
  );
});

// Handle errors
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error);
});

// Handle unhandled rejections
self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason);
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