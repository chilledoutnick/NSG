import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || ""
};

// Initialize Firebase if configured
const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;

// Check if the browser supports Firebase Messaging
let messaging = null;
if (app && "Notification" in window && "serviceWorker" in navigator) {
  try {
    messaging = getMessaging(app);
    console.log("Firebase Messaging Initialized");
  } catch (error) {
    console.warn("Firebase Messaging is not supported in this browser:", error);
  }
} else {
  console.warn("Firebase Cloud Messaging unconfigured or not supported in this browser.");
}

// Request Notification Permission
export const requestNotificationPermission = async () => {
  if (!messaging) {
    console.warn("FCM is not supported or not configured. Skipping notification permission request.");
    return null;
  }

  try {
    const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;
    const token = await getToken(messaging, vapidKey ? { vapidKey } : undefined);


    if (token) {
      console.log("FCM Token:", token);
      return token;
    } else {
      console.log("No registration token available. Request permission to generate one.");
      return null;
    }
  } catch (error) {
    console.error("An error occurred while retrieving token:", error);
    return null;
  }
};

// Listen for messages when the app is in the foreground
export const onMessageListener = () => {
  if (!messaging) {
    console.warn("FCM is not supported. Skipping message listener.");
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};

export default app;