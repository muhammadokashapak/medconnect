/// <reference lib="webworker" />

declare let self: ServiceWorkerGlobalScope;

// To disable all workbox logging during development
self.__WB_DISABLE_DEV_LOGS = true;

// Listen to Push events
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || "MedConnect Notification";
  const message = data.message || "You have a new update.";
  const icon = "/icon-192x192.png";
  const badge = "/icon-192x192.png";
  const url = data.url || "/";

  event.waitUntil(
    self.registration.showNotification(title, {
      body: message,
      icon,
      badge,
      data: { url },
    })
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((windowClients) => {
        // If the window is already open, focus it
        for (const client of windowClients) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // If not open, open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Basic background sync setup
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-cases") {
    console.log("Background sync triggered for cases.");
    // In a full implementation, you would read from IndexedDB and replay failed requests here.
  }
});
