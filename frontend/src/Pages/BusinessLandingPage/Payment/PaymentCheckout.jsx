

import { useEffect } from "react";

export default function PaymentCheckout() {
  useEffect(() => {
   
    if (document.getElementById("stripe-buy-button-script")) return;

    const script = document.createElement("script");
    script.id = "stripe-buy-button-script";
    script.src = "https://js.stripe.com/v3/buy-button.js";
    script.async = true;

    document.body.appendChild(script);
  }, []);

  return (
    <div style={{ padding: "16px" }}>
      <h2>Complete your payment</h2>

      <stripe-buy-button
        buy-button-id={process.env.REACT_APP_STRIPE_BUY_BUTTON_ID || "buy_btn_1SpVFFCeK0xF9nhYMCjgdKBM"}
        publishable-key={process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY}
      />
    </div>
  );
}
