// 🚀 TravelAI Pro Service Worker - PWA Capabilities
const CACHE_NAME = 'travelai-pro-v1.0.0';
const STATIC_CACHE = 'travelai-static-v1';
const DYNAMIC_CACHE = 'travelai-dynamic-v1';
const API_CACHE = 'travelai-api-v1';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/ultimate-travel-app.html',
  '/real-production-api.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap'
];

// API endpoints to cache
const CACHEABLE_APIS = [
  'api.open-meteo.com',
  'nominatim.openstreetmap.org',
  'api.geoapify.com',
  'overpass-api.de',
  'images.unsplash.com'
];

// Install event - cache static files
self.addEventListener('install', event => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Caching static files');
        return cache.addAll(STATIC_FILES);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('✅ Service Worker activated');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName.startsWith('travelai-') && 
              ![STATIC_CACHE, DYNAMIC_CACHE, API_CACHE].includes(cacheName)
            )
            .map(cacheName => {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) return;
  
  event.respondWith(handleFetch(request, url));
});

async function handleFetch(request, url) {
  try {
    // Strategy 1: Cache First for static files
    if (isStaticFile(url)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Strategy 2: Network First with fallback for API calls
    if (isAPICall(url)) {
      return await networkFirstWithCache(request, API_CACHE);
    }
    
    // Strategy 3: Stale While Revalidate for images
    if (isImage(url)) {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE);
    }
    
    // Strategy 4: Network First for everything else
    return await networkFirst(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.error('Fetch failed:', error);
    return await getOfflineFallback(request);
  }
}

// Cache First Strategy - for static files
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const fresh = await fetch(request);
    cache.put(request, fresh.clone());
    return fresh;
  } catch (error) {
    return await getOfflineFallback(request);
  }
}

// Network First with Cache - for API calls
async function networkFirstWithCache(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    
    // Cache successful API responses
    if (response.ok) {
      // Only cache GET requests and specific APIs
      if (request.method === 'GET' && shouldCacheAPI(request.url)) {
        cache.put(request, response.clone());
      }
    }
    
    return response;
  } catch (error) {
    console.log('Network failed, trying cache for:', request.url);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

// Stale While Revalidate - for images
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Always try to fetch fresh version in the background
  const fetchPromise = fetch(request).then(response => {
    cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  
  // Return cached version immediately if available
  return cached || await fetchPromise;
}

// Network First - for dynamic content
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    return await getOfflineFallback(request);
  }
}

// Helper functions
function isStaticFile(url) {
  return STATIC_FILES.some(file => url.href.includes(file)) ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.json') ||
         url.hostname === 'fonts.googleapis.com' ||
         url.hostname === 'fonts.gstatic.com';
}

function isAPICall(url) {
  return CACHEABLE_APIS.some(api => url.hostname.includes(api)) ||
         url.pathname.includes('/api/') ||
         url.hostname === 'data.mongodb-api.com';
}

function isImage(url) {
  return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ||
         url.hostname === 'images.unsplash.com';
}

function shouldCacheAPI(url) {
  // Cache weather, geocoding, and place search results
  return url.includes('open-meteo.com') ||
         url.includes('nominatim.openstreetmap.org') ||
         url.includes('api.geoapify.com') ||
         url.includes('overpass-api.de');
}

async function getOfflineFallback(request) {
  if (request.destination === 'document') {
    // Return cached app shell for document requests
    const cache = await caches.open(STATIC_CACHE);
    return cache.match('/ultimate-travel-app.html');
  }
  
  if (isImage(new URL(request.url))) {
    // Return placeholder image for failed image requests
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#f3f4f6"/><text x="150" y="100" text-anchor="middle" fill="#9ca3af" font-family="sans-serif" font-size="14">Image unavailable offline</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
  
  // Return generic offline response
  return new Response(
    JSON.stringify({ 
      error: 'Offline', 
      message: 'This content is not available offline' 
    }),
    { 
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Background sync for search history
self.addEventListener('sync', event => {
  if (event.tag === 'sync-search-history') {
    event.waitUntil(syncSearchHistory());
  }
});

async function syncSearchHistory() {
  try {
    console.log('🔄 Syncing search history...');
    
    // Get pending searches from IndexedDB
    const pendingSearches = await getPendingSearches();
    
    if (pendingSearches.length > 0) {
      // Send to server when online
      const response = await fetch('/api/sync-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searches: pendingSearches })
      });
      
      if (response.ok) {
        await clearPendingSearches();
        console.log('✅ Search history synced');
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Push notifications for travel updates
self.addEventListener('push', event => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'New travel update available',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      tag: data.tag || 'travel-update',
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'View Details',
          icon: '/action-view.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/action-dismiss.png'
        }
      ],
      requireInteraction: data.requireInteraction || false,
      vibrate: [200, 100, 200]
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'TravelAI Pro',
        options
      )
    );
  } catch (error) {
    console.error('Push notification error:', error);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/ultimate-travel-app.html')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url.includes('ultimate-travel-app.html') && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow('/ultimate-travel-app.html');
        }
      })
    );
  }
});

// Helper functions for IndexedDB operations
async function getPendingSearches() {
  // This would normally use IndexedDB
  // For now, return empty array
  return [];
}

async function clearPendingSearches() {
  // This would normally clear IndexedDB
  // For now, do nothing
  return Promise.resolve();
}

// Share target API support
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  if (url.pathname === '/share-target' && event.request.method === 'POST') {
    event.respondWith(handleShareTarget(event.request));
  }
});

async function handleShareTarget(request) {
  const formData = await request.formData();
  const title = formData.get('title') || '';
  const text = formData.get('text') || '';
  const url = formData.get('url') || '';
  
  // Construct search query from shared content
  const searchQuery = `${title} ${text}`.trim();
  
  // Redirect to app with search query
  const appUrl = `/ultimate-travel-app.html?search=${encodeURIComponent(searchQuery)}`;
  
  return Response.redirect(appUrl, 302);
}

console.log('🚀 TravelAI Pro Service Worker loaded successfully');