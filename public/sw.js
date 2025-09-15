const CACHE_NAME = "medicine-scheduler-v1";
const urlsToCache = [
  "/",
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/manifest.json",
];

// Install service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

// Push notification handler
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || "Time to take your medicine!",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: "medicine-reminder",
    renotify: true,
    requireInteraction: true,
    actions: [
      {
        action: "taken",
        title: "Mark as Taken",
      },
      {
        action: "snooze",
        title: "Snooze (5 min)",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || "Medicine Reminder",
      options
    )
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "taken") {
    // Handle mark as taken
    clients.openWindow("/");
  } else if (event.action === "snooze") {
    // Schedule snooze notification (5 minutes)
    setTimeout(() => {
      self.registration.showNotification("Medicine Reminder - Snooze", {
        body: "You snoozed this reminder. Time to take your medicine!",
        icon: "/favicon.ico",
        tag: "medicine-reminder-snooze",
      });
    }, 5 * 60 * 1000);
  } else {
    // Default action - open app
    clients.openWindow("/");
  }
});