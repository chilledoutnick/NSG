import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

sessionStorage.removeItem("swUpdated");

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <GoogleOAuthProvider clientId={process.env.REACT_APP_CALENDAR_CLIENT_ID}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>
);

serviceWorkerRegistration.unregister();
// Simplified service worker registration
/* if (serviceWorkerRegistration && serviceWorkerRegistration.register) {
  const registration = serviceWorkerRegistration.register();
  if (registration && typeof registration.then === "function") {
    registration
      .then((reg) => {
        console.log("Service Worker Registered:", reg);
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  } else {
    console.error(
      "Service Worker registration function did not return a promise."
    );
  }
} else {
  console.error("Service Worker registration function is not defined.");
}
 */