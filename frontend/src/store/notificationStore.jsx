import { create } from "zustand";
import { requestNotificationPermission } from "../firebase";
import axios from "axios";

export const useNotificationStore = create((set) => ({
  NotificationId: 0,
  setNotificationId: (id, user_id) => {
    set(() => ({ NotificationId: id }));
    triggerNotification(id, user_id);
  },
}));

const handleRequestPermission = async (user_id) => {
  const token = await requestNotificationPermission();
  if (token) {
    handleSaveToken(token, user_id);
  } else {
    console.log("Permission denied for notifications.");
  }
};

const handleSaveToken = async (fcmToken, user_id) => {
  try {
    const response = await axios.post(
      axios.defaults.baseURL + "/api/notification/user_fcm_token/",
      {
        fcm_token: fcmToken,
        user_id: JSON.parse(user_id),
      }
    );
    console.log("FCM Token saved to backend: ", response.data);
  } catch (error) {
    console.error("Error saving FCM token to backend: ", error);
  }
};

export const createNotification = (title, body, url) => {
  const notification = new Notification(title, {
    body,
    icon: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/NSG_512x512_png.webp",
    data: { url },
  });

  notification.onclick = (event) => {
    event.preventDefault();
    window.open(notification.data.url, "_blank");
  };
};

// Centralized notification trigger
const triggerNotification = (id, user_id) => {
  if (Notification.permission === "granted") {
    // dispatchNotification(id);
    handleRequestPermission(user_id);
  } else if (Notification.permission === "default") {
    Notification.requestPermission()
      .then((permission) => {
        if (permission === "granted") {
          // dispatchNotification(id);
          handleRequestPermission(user_id);
        } else {
          console.warn("Notification permission denied.");
        }
      })
      .catch((error) =>
        console.error("Error requesting notification permission:", error)
      );
  } else {
    console.warn("Notification permission is denied permanently.");
  }
};

// Dispatch notification based on ID
// const dispatchNotification = (id) => {
//   if (id === 1) {
//     createNotification(
//       "Welcome to NSG!",
//       "Let’s set up your profile to start seamless networking.",
//       "/"
//     );
//   } else if (id === 2) {
//     createNotification(
//       "You’ve added your first contact.",
//       "Great start! Add a note to recall important details!",
//       "/people"
//     );
//   }
// };
