// Service Worker Logger
// This logs service worker events and caching operations

const CACHE_NAME = 'livinning-cache-v1';
const LOG_CACHE = 'livinning-logs-cache';

// Log function for service worker
function swLog(level, message, data = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    component: 'ServiceWorker',
    message,
    data
  };
  
  console.log(`🔧 [SW] [${level.toUpperCase()}] ${message}`, data);
  
  // Store logs in cache for later retrieval
  try {
    caches.open(LOG_CACHE).then(cache => {
      const logKey = `sw-log-${Date.now()}`;
      cache.put(logKey, new Response(JSON.stringify(logEntry)));
    });
  } catch (error) {
    console.error('Failed to cache service worker log:', error);
  }
}

// Service Worker Events
self.addEventListener('install', (event) => {
  swLog('info', 'Service Worker installing', { event: 'install' });
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      swLog('info', 'Cache opened', { cacheName: CACHE_NAME });
      return cache.addAll([
        '/',
        '/enable-logs.js',
        // Add other critical resources here
      ]).then(() => {
        swLog('info', 'Critical resources cached');
      }).catch((error) => {
        swLog('error', 'Failed to cache critical resources', { error: error.message });
      });
    })
  );
  
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  swLog('info', 'Service Worker activating', { event: 'activate' });
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== LOG_CACHE) {
            swLog('info', 'Deleting old cache', { cacheName });
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      swLog('info', 'Service Worker activated');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only log interesting requests (not every tiny asset)
  if (url.pathname.startsWith('/api/') || 
      url.pathname.endsWith('.html') || 
      url.pathname.endsWith('.js') ||
      url.pathname === '/') {
    
    swLog('debug', 'Fetch request', {
      url: request.url,
      method: request.method,
      mode: request.mode
    });
  }
  
  // Cache-first strategy for static assets
  if (request.destination === 'image' || 
      request.destination === 'script' || 
      request.destination === 'style') {
    
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          swLog('debug', 'Cache hit', { url: request.url });
          return response;
        }
        
        swLog('debug', 'Cache miss, fetching', { url: request.url });
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
              swLog('debug', 'Cached response', { url: request.url });
            });
          }
          return response;
        }).catch((error) => {
          swLog('error', 'Fetch failed', { url: request.url, error: error.message });
          throw error;
        });
      })
    );
  }
});

// Handle background sync (if implemented)
self.addEventListener('sync', (event) => {
  swLog('info', 'Background sync event', { tag: event.tag });
});

// Handle push notifications (if implemented)
self.addEventListener('push', (event) => {
  swLog('info', 'Push notification received', { 
    hasData: !!event.data,
    data: event.data ? event.data.text() : null 
  });
});

// Handle errors
self.addEventListener('error', (event) => {
  swLog('error', 'Service Worker error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

// Handle unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
  swLog('error', 'Unhandled promise rejection in SW', {
    reason: event.reason
  });
});

swLog('info', 'Service Worker script loaded');