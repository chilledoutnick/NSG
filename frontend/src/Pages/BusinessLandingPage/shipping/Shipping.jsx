// import { useState } from "react";
import { useState, useRef, useEffect } from "react";
import "./Shipping.scss";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import DepositModal from "../Depositmodal/Depositmodal";

const STRIPE_CHECKOUT_MAP = {
  // metal39: "https://buy.stripe.com/test_8x2fZgeJK0q50z14FPeME07", //test
  metal39: "https://buy.stripe.com/cNi3cu1WYdcR3Lda09eME1r",
  // metal79: "https://buy.stripe.com/test_4gM00i59a3ChftV0pzeME09", //test
  metal79: "https://buy.stripe.com/7sYfZg9pq8WBgxZegpeME1q",
  // metal99: "https://buy.stripe.com/test_8x28wO59a6Ot5Tl3BLeME0a",   //test
  metal99: "https://buy.stripe.com/28E28qbxy7Sx5Tl2xHeME1p",
};

const STRIPE_DEPOSIT_MAP = {
  metal39: " https://buy.stripe.com/bJe14mcBCc8N81t3BLeME1s",
  // metal39: " https://buy.stripe.com/test_bJebJ0fNO0q5epR8W5eME0g",
  // metal79: "https://buy.stripe.com/test_eVq00icBC1u95TlegpeME0h",
  metal79: "https://buy.stripe.com/6oUcN4bxy7Sx3Ld3BLeME1t",
  // metal99: "https://buy.stripe.com/test_aFa4gy9pq3Ch6XpgoxeME0i",
  metal99: "https://buy.stripe.com/6oU14meJKfkZ6Xp2xHeME1u",
};



const IMAGE_MAP = {
  metal39:
    "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/50683c7a52c043b88653e9ce1fd9e3dd.webp",
  metal79:
    "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/675b5aa8de0e4a33a169d29c2c7c050a.webp",
  metal99:
    "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/bb51df6ace404c0590e27e95bed7040d.webp",
};

const TITLE_MAP = {
  metal39: "Everyday Matte",
  metal79: "Metal Classic",
  metal99: "Metal Signature",
};

const PRICE_MAP = {
  metal39: { original: 39, price: 39 },
  metal79: { original: 79, price: 59 },
  metal99: { original: 99, price: 74 },
};

const USERS_AVATAR =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/82cfc541430f41f287edfd6633a9e00c.webp";

const SSL_ICON =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/f668392c12824d9783eed1bbae737625.webp";

const SHIELD_ICON =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/24b56d4d439146fbbdf6284bf56474de.webp";

const FAQS = [
  {
    id: 4,
    question: "What if I lose or damage my card?",
    answer: (
      <>
        <p>
          Enjoy lifetime protection against loss or damage. If your card is ever
          lost or damaged, we'll replace it and cover 40% of the cost.
        </p>
      </>
    ),
  },

  {
    id: 6,
    question: "What is our Return and Exchange Policy?",
    answer: (
      <>
        <p>
          All sales are final. We do not accept returns. However, if your card
          arrives damaged or with an error on our part, we will replace it free
          of charge.
        </p>
      </>
    ),
  },
];

export default function Shipping() {
  const order = JSON.parse(localStorage.getItem("order")) || {};
  const selectedPlan = order.card_type || order.metal_card || "metal79";

  const originalPrice =
    order.original_price || PRICE_MAP[selectedPlan]?.original || 39;

  const planPrice =
    order.card_price ||
    order.metal_price ||
    PRICE_MAP[selectedPlan]?.price ||
    39;

  const total = planPrice;

  const [isExpanded, setIsExpanded] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleDepositCheckout = () => {
  const storedOrder = JSON.parse(localStorage.getItem("order")) || {};

  const selectedPlan =
    storedOrder.card_type || storedOrder.metal_card || "metal79";

  const emailRaw = storedOrder.customer_email || "";

  const checkoutUrl = STRIPE_DEPOSIT_MAP[selectedPlan];

  if (!checkoutUrl) {
    alert("Deposit payment not available.");
    return;
  }

  const email = String(emailRaw || "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "");

  const finalStripeUrl = email
    ? `${checkoutUrl}?prefilled_email=${encodeURIComponent(email)}`
    : checkoutUrl;

  window.location.href = finalStripeUrl;
};

  const handleCheckout = () => {
    const storedOrder = JSON.parse(localStorage.getItem("order")) || {};

    const metalCard =
      storedOrder.card_type || storedOrder.metal_card || "metal79";

    const emailRaw = storedOrder.customer_email || "";

    const checkoutUrl = STRIPE_CHECKOUT_MAP[metalCard];

    if (!checkoutUrl) {
      alert("Payment option not available.");
      return;
    }

    const email = String(emailRaw || "")
      .trim()
      .toLowerCase()
      .replace(/['"]/g, "");

    localStorage.setItem("checkout_email", email);

    const finalStripeUrl = email
      ? `${checkoutUrl}?prefilled_email=${encodeURIComponent(email)}`
      : checkoutUrl;

    window.location.href = finalStripeUrl;
  };

  // PersonalizeCard.jsx mein useEffect add karo
  useEffect(() => {
    const handleViewport = () => {
      const cta = document.querySelector(".cta-fixed");
      if (!cta) return;
      if (window.visualViewport) {
        cta.style.bottom = `${window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop}px`;
      }
    };

    window.visualViewport?.addEventListener("resize", handleViewport);
    window.visualViewport?.addEventListener("scroll", handleViewport);

    return () => {
      window.visualViewport?.removeEventListener("resize", handleViewport);
      window.visualViewport?.removeEventListener("scroll", handleViewport);
    };
  }, []);

  const videoRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play();
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.5 },
    );
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <div className="shipping-page">
       <DepositModal onCheckout={handleDepositCheckout} autoOpen={true} />
        <div className="order-summary">
          <h3 className="order-summary-title">Order Summary</h3>

          <div className="summary-item">
            <div className="product-row">
              <img
                src={IMAGE_MAP[selectedPlan]}
                alt="card"
                className="product-img"
              />
              <div className="product-details">
                <h4 className="product-name">{TITLE_MAP[selectedPlan]}</h4>
                <p className="product-text">Your personalized card</p>
              </div>
              <div className="product-prices">
                {selectedPlan !== "metal39" && originalPrice > planPrice && (
                  <span className="old-price">${originalPrice}</span>
                )}
                <span className="new-price">${planPrice}</span>
              </div>
            </div>
          </div>

          <div className="summary-item">
            <div className="row-between">
              <p className="label">NSG Pro</p>
              <p className="value">Included</p>
            </div>
            <p className="description">
              Digital profile, contact management, and <br /> follow up —
              Instant Access, Digitally
            </p>
          </div>

          <div className="summary-item">
            <div className="row-between">
              <div className="shipping-info">
                {/* <img src={SHIPPING_ICON} alt="shipping" className="icon" /> */}
                <div>
                  <p className="label">Shipping</p>
                  <p className="subtext">(5-12 Business Days)</p>
                </div>
              </div>
              <p className="value">Free</p>
            </div>
          </div>

          <div className="total-row">
            <p className="total-label">Total</p>
            <p className="total-amount">
              {" "}
              {selectedPlan !== "metal39" && (
                <span className="old-price ship"> ${originalPrice}</span>
              )}{" "}
              ${total}
            </p>
          </div>
          <p className="urgency-text">
            only <strong> 3 cards left </strong> at this price!
          </p>
        </div>

        <div className="review-quote-box">
          <div className="review-quote-stars">
            <StarIcon />
            <StarIcon />
            <StarIcon />
            <StarIcon />
            <StarHalfIcon />
            <span className="review-quote-score">4.3</span>
            <span className="review-quote-divider">|</span>
            <span className="review-quote-count">142 Reviews</span>
          </div>
          <p className="review-quote-text">
            "I went in with an open mind and I loved the card that was created.
            As I was developing my profile.
            {!isExpanded && (
              <>
                {" "}
                <span
                  className="review-read-more"
                  onClick={() => setIsExpanded(true)}
                >
                  Read more
                </span>
              </>
            )}
            {isExpanded && (
              <>
                {" "}
                I realized how powerful it is to have everything in one place —
                my contact info, social links, and a way for people to save me
                instantly. No more handing out paper cards that get lost. The
                metal card feels premium and people always comment on it. NSG
                has completely changed how I network."{" "}
                <span
                  className="review-read-more"
                  onClick={() => setIsExpanded(false)}
                >
                  Read less
                </span>
              </>
            )}
            {!isExpanded && ""}
          </p>

          <p className="review-quote-name">Walter</p>
          <p className="review-quote-role">
            Sacramento County Department of Airports
          </p>
        </div>
       

        <div className="cta-fixed">
          <button className="primaryy-btn" onClick={handleCheckout}>
            <span>Continue Checkout</span>
            <span className="button-price">${planPrice}</span>
          </button>
          <div className="trust-section">
            <div className="trust-row">
              <img src={USERS_AVATAR} alt="users" className="trust-avatar" />
              <span className="trust-text">
                Used by <strong>2K+</strong> professionals
              </span>
            </div>
            <div className="security-row">
              <div className="security-badge">
                <img src={SSL_ICON} alt="ssl" className="badge-icon" />
                <span className="badge-text bl">SSL Secure Checkout</span>
              </div>
              <div className="security-badge">
                <img src={SHIELD_ICON} alt="shield" className="badge-icon" />
                <span className="badge-text gr">Loss/Damage Coverage</span>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="video-section">
          <video
            ref={videoRef}
            className="video-player"
            muted
            loop
            playsInline
            // poster="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/675b5aa8de0e4a33a169d29c2c7c050a.webp"
          >
            {/* Replace this src with real video URL later */}
        {/* <source
              src="https://storage.googleapis.com/nsg-db-storage-public/media/videos/Unlock_Seamless_Networking_with_NSG_Tech-_A_Revolutionary_Digital_Card_ExperienceIm_th.mp4"
              type="video/mp4"
            />
          </video> */}
        {/* </div> */}
        <section className="faq-section">
          {/* <h2 className="faq-title">
            Everything You Need To Know Before Checkout
          </h2> */}
          <div className="faq__box">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className={`faq__item ${openFaq === i ? "active" : ""}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="faq__question">
                  <span>{faq.question}</span>
                  <KeyboardArrowDownIcon
                    className={openFaq === i ? "rotate" : ""}
                  />
                </div>
                <div className="faq__answer">{faq.answer}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
