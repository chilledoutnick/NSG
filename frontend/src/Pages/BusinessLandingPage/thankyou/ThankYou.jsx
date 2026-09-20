import React, { useEffect, useState } from "react";
import "./ThankYou.scss";
import axios from "axios";
import CheckIcon from "@mui/icons-material/Check";

const ThankYou = () => {
  const [seconds, setSeconds] = useState(8);
  const [paymentVerified, setPaymentVerified] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      console.error("❌ session_id not found in URL");
      return;
    }
    sessionStorage.setItem("stripe_session_id", sessionId);

    let attempts = 0;
    const maxAttempts = 6;

    const checkPayment = async () => {
      try {
        const res = await axios.post("/api/billing/payment_details/", {
          session_id: sessionId,
        });

        console.log("💰 Payment API Response:", res.data);

        const email =
          res.data?.checkout_session?.customer_details?.email ||
          res.data?.customer_email || // add this
          res.data?.email;

            console.log("📧 Email found:", email); 

        if (!email) {
          throw new Error("Email missing in Stripe session");
        }

        // Store verification flags
        localStorage.setItem("metal_payment_verified", "true");
        console.log("✅ localStorage set");

        sessionStorage.setItem("signup_start_url", "metal");
        sessionStorage.setItem("signup_email", email);

        setPaymentVerified(true);

        console.log("🔥 Payment verified successfully");
      } catch (err) {
        attempts++;
        console.error("❌ EXACT ERROR:", err);
        console.log(`⏳ Retry attempt ${attempts}`);

        if (attempts < maxAttempts) {
          setTimeout(checkPayment, 2000);
        } else {
          console.error("❌ Payment verification failed", err);
        }
      }
    };

    checkPayment();
  }, []);

  useEffect(() => {
    if (!paymentVerified) return;

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          // window.location.href = "https://nsgapi-test.herokuapp.com/signup/metal";
          window.location.href = "/signup/metal";

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentVerified]);

  return (
    <div className="thankyou">
      <div className="thankyou__card">
        <div className="thankyou__top">
          <div className="thankyou__icon">
            <CheckIcon className="check-icon" />
          </div>

          <h1>Welcome to NSG!</h1>

          <p>
            Always with you when you capture, manage and grow your business
            connections
          </p>
        </div>

        <div className="thankyou__bottom">
          <span>REDIRECTING TO SETUP...</span>

          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: `${(8 - seconds) * 12.5}%` }}
            />
          </div>

          <p className="redirect">Redirecting in {seconds} seconds...</p>

          <div className="thankyou__logo">
            <img
              src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/47f2c63eb9c743c88c1acdc80a93b1fc.webp"
              alt="NSG"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
