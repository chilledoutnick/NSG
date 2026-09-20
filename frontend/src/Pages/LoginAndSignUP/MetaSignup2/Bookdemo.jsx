import { useEffect } from "react";

import { useNavigate } from "react-router-dom";

export default function BookDemo() {
  const navigate = useNavigate();

  useEffect(() => {
    const signupInfo = JSON.parse(
      sessionStorage.getItem("local_signup_info") || "{}"
    );

    let url = "https://calendly.com/team-nsg/30min?primary_color=410099";

    if (signupInfo?.name) url += `&name=${encodeURIComponent(signupInfo.name)}`;

    if (signupInfo?.email)
      url += `&email=${encodeURIComponent(signupInfo.email)}`;

    if (signupInfo?.phonenumber) {
      url += `&customAnswers[0]=${encodeURIComponent(signupInfo.phonenumber)}`;
    }

    if (window.Calendly) {
      window.Calendly.initInlineWidget({
        url,

        parentElement: document.getElementById("calendly-container"),

        prefill: {
          name: signupInfo.name,

          email: signupInfo.email,

          customAnswers: [
            { question: "Phone", answer: signupInfo.phonenumber },
          ],
        },
      });
    }

    const handleMessage = (e) => {
      if (e.data.event === "calendly.event_scheduled") {
        setTimeout(() => {
          navigate("/metasignup2/metaconfirmbook");
        }, 1000);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div
        style={{
          display: "flex",
          backgroundColor: "#fff",

          justifyContent: "center",

         padding: "20px 10px",
        }}
      >
        <h1
  style={{
    background: "linear-gradient(90deg, #410099 0%, #9C4EFF 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontFamily: "open sans, sans-serif",
    lineHeight: 1.5,
    fontWeight: "700",
    fontSize: 30,
    padding: " 0px",
    textAlign: "center",
    maxWidth: "300px",
    wordWrap: "break-word",
  }}
>
  Request a Personalized Demo
</h1>
      </div>

      <div
        id="calendly-container"
        style={{ minWidth: 320, height: "100%" }}
      ></div>
    </div>
  );
}

