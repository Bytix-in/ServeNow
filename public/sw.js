// Service Worker for ServeNow notifications
self.addEventListener('install', function(event) {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Order update',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: data.tag || 'order-update',
      requireInteraction: false,
      silent: false,
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'view',
          title: 'View Order',
          icon: '/favicon.ico'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Order Update', options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    // Focus on the app window
    event.waitUntil(
      self.clients.matchAll().then(function(clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes('/order-status/') && 'focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow('/');
        }
      })
    );
  }
}); 