// Service Worker pour PWA HRlead
const CACHE_NAME = 'hrlead-v1.0.0';
const STATIC_CACHE = 'hrlead-static-v1';
const DYNAMIC_CACHE = 'hrlead-dynamic-v1';

// Fichiers à mettre en cache statique
const STATIC_FILES = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html'
];

// Install event - Cache des fichiers statiques
self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[SW] Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Cache install failed:', error);
      })
  );
});

// Activate event - Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Old caches cleaned');
        return self.clients.claim();
      })
  );
});

// Fetch event - Stratégie de cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Stratégie différente selon le type de ressource
  if (request.method === 'GET') {
    if (url.pathname.startsWith('/api/')) {
      // API calls - Network first, fallback to cache
      event.respondWith(handleApiRequest(request));
    } else if (url.pathname.startsWith('/static/')) {
      // Static assets - Cache first, fallback to network
      event.respondWith(handleStaticRequest(request));
    } else {
      // HTML pages - Network first, fallback to cache
      event.respondWith(handlePageRequest(request));
    }
  }
});

// Gestion des requêtes API
async function handleApiRequest(request) {
  try {
    // Essayer le réseau d'abord
    const networkResponse = await fetch(request);
    
    // Mettre en cache la réponse si elle est valide
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for API:', request.url);
    
    // Fallback vers le cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Retourner une réponse d'erreur personnalisée
    return new Response(
      JSON.stringify({ 
        error: 'Offline - Données non disponibles',
        message: 'Vérifiez votre connexion internet'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Gestion des ressources statiques
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Static resource fetch failed:', request.url);
    return new Response('Resource not available offline', { status: 404 });
  }
}

// Gestion des pages HTML
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Page fetch failed, serving offline page:', request.url);
    
    // Retourner la page offline
    const offlineResponse = await caches.match('/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Fallback vers la page d'accueil
    return caches.match('/');
  }
}

// Gestion des notifications push
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nouvelle notification',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: data.tag || 'hrlead-notification',
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'HRlead', options)
    );
  }
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action) {
    // Gestion des actions personnalisées
    handleNotificationAction(event.action, event.notification.data);
  } else {
    // Action par défaut - Ouvrir l'application
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Gestion des actions de notification
function handleNotificationAction(action, data) {
  switch (action) {
    case 'view_event':
      clients.openWindow(`/events/${data.eventId}`);
      break;
    case 'view_leave':
      clients.openWindow(`/leaves/${data.leaveId}`);
      break;
    case 'mark_read':
      // Marquer comme lu
      break;
    default:
      clients.openWindow('/');
  }
}

// Gestion des messages du client
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Background sync pour les actions offline
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Synchronisation en arrière-plan
async function doBackgroundSync() {
  try {
    // Récupérer les actions en attente depuis IndexedDB
    const pendingActions = await getPendingActions();
    
    for (const action of pendingActions) {
      try {
        await processPendingAction(action);
        await removePendingAction(action.id);
      } catch (error) {
        console.error('[SW] Background sync failed for action:', action, error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Récupération des actions en attente (placeholder)
async function getPendingActions() {
  // Ici, on récupérerait depuis IndexedDB
  return [];
}

// Traitement d'une action en attente (placeholder)
async function processPendingAction(action) {
  // Ici, on traiterait l'action selon son type
  console.log('[SW] Processing pending action:', action);
}

// Suppression d'une action traitée (placeholder)
async function removePendingAction(actionId) {
  // Ici, on supprimerait depuis IndexedDB
  console.log('[SW] Removing processed action:', actionId);
}

console.log('[SW] Service Worker loaded successfully'); 