
import React, { useEffect } from "react";
 
 
const nsgLogo =
 
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/0e39285bb21549ef996eae71cfb2c462.webp";
 
 
export default function MetaConfirmBook()
 
 {
 
    useEffect(() => {
 
    // Preload Calendly when component mounts if it's a navigation component
 
    if (!window.calendlyScriptPreloaded) {
 
      const script = document.createElement('script');
 
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
 
      script.async = true;
 
      document.body.appendChild(script);
 
      window.calendlyScriptPreloaded = true;
 
    }
 
  }, []);
 
  return (
 
    <div style={{ textAlign: "center", padding: "40px" }}>
 
      <img src={nsgLogo} alt="" />
 
      <h1
 
        style={{
 
          background: "linear-gradient(90deg, #410099 0%, #9C4EFF 100%)",
 
          WebkitBackgroundClip: "text",
 
          WebkitTextFillColor: "transparent",
 
          fontFamily: "open sans, sans-serif",
 
          lineHeight: 1.5,
 
          fontWeight: "700",
 
          fontSize: 28,
 
          marginTop: 32,
 
          marginBottom: 8,
 
        }}
 
      >
 
        Quick Overview Before Your Demo
 
      </h1>
 
 
      <div
 
        style={{
 
          display: "flex",
 
          justifyContent: "center",
 
          paddingTop: "24px",
 
        }}
 
      >
 
        <iframe
 
          width="100%"
 
          height="207"
 
          style={{ maxWidth: "366px", border: "none" }}
 
          src="https://www.youtube.com/embed/AkSPgfFxfdM?si=o1m8CsoCk40UoMcw"
 
          title="YouTube video player"
 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture
in-picture; web-share"
 
          referrerPolicy="strict-origin-when-cross-origin"
 
          allowFullScreen
 
        ></iframe>
 
      </div>
 
      <p style={{ marginTop: 32, marginBottom: 12 }}>
 
        See you in the demo! Get a tailored walkthrough and kick off your 7-day
 
        trial.
 
      </p>
 
      <h6 style={{ fontWeight: 700, fontSize: 16 }}>
 
        Don’t forget to accept the calendar invite to confirm your spot.
 
      </h6>
 
    </div>
 
  );
 
}
 
