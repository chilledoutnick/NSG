/* global importScripts, initSuprSend, firebase */

//////////////////////////////////////
// SuprSend SDK
//////////////////////////////////////

importScripts("https://cdn.jsdelivr.net/npm/@suprsend/web-sdk@latest/public/serviceworker.min.js");

// Read configuration from service worker registration URL query parameters
const params = new URL(location).searchParams;
const suprSendKey = params.get("suprsend_key");
if (suprSendKey && typeof initSuprSend === "function") {
  initSuprSend(suprSendKey);
}

//////////////////////////////////////
// Firebase Messaging
//////////////////////////////////////

importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js");

const apiKey = params.get("apiKey");
let messaging = null;

if (apiKey && typeof firebase !== "undefined" && firebase.initializeApp) {
  firebase.initializeApp({
    apiKey: apiKey,
    authDomain: params.get("authDomain") || "",
    projectId: params.get("projectId") || "",
    storageBucket: params.get("storageBucket") || "",
    messagingSenderId: params.get("messagingSenderId") || "",
    appId: params.get("appId") || "",
  });
  messaging = firebase.messaging();
}


// Background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message:",
    payload
  );

  // Optional: show notification
  // const notificationTitle = payload.notification?.title || "New Notification";
  // const notificationOptions = {
  //   body: payload.notification?.body || "You have a new message.",
  //   icon: payload.notification?.icon,
  //   data: { link: payload.fcmOptions?.link || "/" },
  // };
  // self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);
  event.notification.close();

  const notificationLink = event?.notification?.data?.link || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (let client of clientList) {
          if ("focus" in client) {
            return client.navigate(notificationLink).then(() => client.focus());
          }
        }
        return clients.openWindow(notificationLink);
      })
  );
});