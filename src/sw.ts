import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

declare const self: ServiceWorkerGlobalScope;

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();

// @ts-ignore
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'Caldinho 74';
  const options: NotificationOptions = {
    body: data.body || '',
    icon: '/mx-logo-v2-192.png',
    badge: '/mx-logo-v2-192.png',
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  event.waitUntil(
    (self as any).clients.matchAll({ type: 'window' }).then((clientList: any[]) => {
      const url = event.notification.data?.url || '/';
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      return (self as any).clients.openWindow(url);
    })
  );
});
