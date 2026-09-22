import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PricingCheckout from "./PricingCheckout";
import CheckoutSkeleton from "./CheckoutSkelton/CheckoutSkeleton";




function Payment() {
  const location = useLocation();         
  const pathname = window.location.pathname;
  const isUpgrade = pathname === "/account/checkout";
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true); 

  const metahash = window.location.hash === "#metasignup" ? true : false;
  const meta_coupon = location.state?.meta_coupon;
  const isQuarterly = location.state?.isQuarterly;
  const isLifetime = location.state?.isLifetime;
  const meta_plan =
    sessionStorage.getItem("meta_plan") === "lifetime" || isLifetime;
  const meta_plan_monthly = sessionStorage.getItem("meta_plan") === "monthly";
  const meta_plan_quarterly =
    sessionStorage.getItem("meta_plan") === "quarterly" || isQuarterly;
  let isMeta =
    location.state?.isMetaSignup2 || location.state?.isMetaSignup || metahash;
  let signup_start_url = sessionStorage.getItem("signup_start_url");
  const isAnnual =
    signup_start_url === "starter-annual" || signup_start_url === "pro-annual";

  let period = meta_plan_monthly
    ? "monthly"
    : meta_plan_quarterly
    ? "quarterly"
    : isMeta || meta_plan
    ? "yearly"
    : isAnnual
    ? "yearly"
    : "quarterly";


let apiUrl = window.REACT_APP_API_URL;
let nsg_lifetime;
let product_id;
if (apiUrl === "{{ api_url }}" || apiUrl === "https://nsgapi-test.herokuapp.com") {
  // TEST________________________
 
  let Starter = "prod_SOwBXCBPxrTbq4";
  let Pro = "prod_SOwEa2wG9hEzsN";
  let nsg_id =
    signup_start_url === "starter-quarterly" ||
     signup_start_url === "starter-annual"
       ? Starter
       : Pro;
   nsg_lifetime = "prod_SZSInroQSnRXZh";

  //  let nsg_ids = "prod_P9LkDLTwwn0o4B"; // test;
  let meta_id = "prod_RuxVELnJAYqez1"; // test;
  // let meta_id2 = "prod_S1KytgUOcC4MCd"; // test;
  product_id = location.state?.isMetaSignup ? meta_id : nsg_id; // test;

  // TEST________________________
 
}
else{
   // MAIN________________________

  let Starter = "prod_SOahKG8rKpII0p";
  let Pro = "prod_SOalkQQ46wDbam";
  let nsg_id =
    signup_start_url === "starter-quarterly" ||
    signup_start_url === "starter-annual"
      ? Starter
      : Pro;
  // let nsg_id = "prod_Q9bRmxVOvUUPNm"; //do not use this one on main
  nsg_lifetime = "prod_S6vm4Nggcerayj";
  let nsg_quarterly = "prod_S9cSVinWbwWNZE";
  let nsg_monthly = "prod_Sl2kjDlwyJGtYx";
  // // let meta_id = "prod_Ruy8w0kNjOWOAV"; // do not use this one on maiN
  let meta_id = "prod_S9cSVinWbwWNZE";
  const isMetaSignup =
    location.state?.isMetaSignup2 || metahash || location.state?.isMetaSignup
      ? meta_id
      : undefined;
  product_id = meta_plan_monthly
    ? nsg_monthly
    : meta_plan
    ? nsg_lifetime
    : meta_plan_quarterly
    ? nsg_quarterly
    : isMetaSignup
    ? meta_id
    : nsg_id; // main;
    
  // MAIN________________________


}
     


  
   
  const signup_data = isUpgrade
    ? JSON.parse(localStorage.getItem("user_info"))
    : JSON.parse(sessionStorage.getItem("signup_data"));

  useEffect(() => {
    const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
    if (publishableKey) {
      setStripePromise(loadStripe(publishableKey));
    }
  }, []);

  useEffect(() => {
   get_stripe_details();
  }, []);

  const get_stripe_details = () => {
    const url = "api/stripe/get_stripe_details/";
    const payload = {
      period: nsg_lifetime === product_id ? "one_time" : period,
      coupon: "",
      product_id: product_id,
    };
    axios
      .post(url, payload)
      .then((res) => {
        create_payment_intent(res.data);
        sessionStorage.setItem("product_details", JSON.stringify(payload));
      })
      .catch((err) => console.log("err", err));
  };

  const create_payment_intent = (data) => {
    fetch(axios.defaults.baseURL + "/api/billing/create_payment_intent/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: signup_data.name,
        email: signup_data.email,
        amount: data.amount,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          console.error("Failed to create payment intent:", response.statusText);
          return;
        }
        const data = await response.json();
        const { client_secret: clientSecret } = data;
        setClientSecret(clientSecret);
        setLoading(false); // <-- loading false jab data aa gaya
        sessionStorage.setItem("stripe_details", JSON.stringify(data));
      })
      .catch((error) => console.error("Error fetching payment intent:", error));
  };

  const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  const isStripeConfigured = Boolean(publishableKey && publishableKey.trim() !== "");

  if (!isStripeConfigured) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '40px 30px', textAlign: 'center', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: '42px', marginBottom: '16px' }}>🎉</div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px', color: '#111827' }}>
          Stripe Payment Not Configured
        </h2>
        <p style={{ color: '#4b5563', marginBottom: '28px', lineHeight: '1.6', fontSize: '15px' }}>
          Payment processing is not set up yet. The platform is operating in <strong>Free Mode</strong> — no credit card or payment is required.
        </p>
        <button
          onClick={() => {
            sessionStorage.setItem("signup_start_url", "free");
            window.location.href = isUpgrade ? "/account" : "/signup/domain";
          }}
          style={{
            backgroundColor: '#000',
            color: '#fff',
            padding: '12px 28px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Continue with Free Setup →
        </button>
      </div>
    );
  }

  // Loader condition
  if (loading || !clientSecret || !stripePromise) {
    return <CheckoutSkeleton />;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PricingCheckout
        isUpgrade={isUpgrade}
        isMetaSignup={location.state?.isMetaSignup}
        isMetaSignup2={location.state?.isMetaSignup2}
        meta_coupon={meta_coupon}
        clientSecret={clientSecret}

      />
    </Elements>
  );
}

export default Payment;
