import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
// import DepositModal from "../Depositmodal/Depositmodal";
import "./CreateYourCard.scss";
import Footer from "../footerNew.jsx";

// const STRIPE_DEPOSIT_MAP = {
//   metal39: "https://buy.stripe.com/bJe14mcBCc8N81t3BLeME1s",
//   metal79: "https://buy.stripe.com/6oUcN4bxy7Sx3Ld3BLeME1t",
//   metal99: "https://buy.stripe.com/6oU14meJKfkZ6Xp2xHeME1u",
// };

const NFC_IMG =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/471b97a8233943879ad2d4e93fdd8d51.webp";

const NSG_LOGO =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/915d14d99c1b4a27a5f03047e2213333.webp";

const CreateYourCard = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  // const [showDepositModal, setShowDepositModal] = useState(false);
  const order = JSON.parse(localStorage.getItem("order")) || {};

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const trackedFields = [name.trim(), title.trim(), email.trim()];
  const completedFields = trackedFields.filter(Boolean).length;
  const progressPercent = Math.round((completedFields / 3) * 100);

  useEffect(() => {
    const order = JSON.parse(localStorage.getItem("order")) || {};

    if (order?.card_details) {
      setName(order.card_details.name || "");
      setTitle(order.card_details.title || "");
    }

    if (order?.customer_email) {
      setEmail(order.customer_email);
    }
  }, []);

  useEffect(() => {
    const order = JSON.parse(localStorage.getItem("order")) || {};
    order.card_details = {
      name,
      title,
      has_logo: false,
    };
    order.customer_email = email;
    localStorage.setItem("order", JSON.stringify(order));
  }, [name, title, email]);

  const add_sender_data = () => {
    const Abandoned = "dGzk4L";
    const url = "api/feature/add_sender_data/";
    const safeEmail = email?.trim();
    const safeName = name?.trim() || "User";
    const fullName = safeName.split(" ");
    const payload = {
      email: safeEmail,
      firstname: fullName[0] || "User",
      lastname: fullName.length > 1 ? fullName[fullName.length - 1] : "",
      phone: "+1" + (order?.phone || ""),
      tags: [Abandoned],
    };
    return axios.post(url, payload);
  };

  const closeLead = () => {
    const url = "api/feature/close_lead/";
    const payload = {
      name,
      contact_name: name,
      email,
      feel_familiar: "",
      lead_source: "Facebook",
    };
    return axios.post(url, payload);
  };

  const checkEmailAPI = async (email) => {
    try {
      const res = await axios.post("/api/user/email_check/", { email });
      return res.data.email_exists;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Email verification failed",
      );
    }
  };

  const handleContinue = async () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Enter valid email";
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    try {
      const emailExists = await checkEmailAPI(email);
      if (emailExists) {
        setErrors({ email: "Email already exists" });
        return;
      }
      if (axios.defaults.baseURL === "https://nsgcrm.com") {
        await Promise.all([add_sender_data(), closeLead()]);
      }
      navigate("/shipping-method");
    } catch (err) {
      setErrors({
        email: err.message || "Something went wrong. Please try again.",
      });
    }
  };

  // const handleDepositCheckout = () => {
  //   const order = JSON.parse(localStorage.getItem("order")) || {};
  //   const selectedPlan = order.metal_card || "metal39";
  //   const checkoutUrl = STRIPE_DEPOSIT_MAP[selectedPlan];
  //   if (!checkoutUrl) {
  //     alert("Deposit payment not available.");
  //     return;
  //   }
  //   const finalUrl = email
  //     ? `${checkoutUrl}?prefilled_email=${encodeURIComponent(email)}`
  //     : checkoutUrl;
  //   window.location.href = finalUrl;
  // };

  // const handleReserveNow = async () => {
  //   const newErrors = {};
  //   if (!name.trim()) newErrors.name = "Name is required";
  //   if (!email.trim()) {
  //     newErrors.email = "Email is required";
  //   } else if (!isValidEmail(email)) {
  //     newErrors.email = "Enter valid email";
  //   }
  //   if (Object.keys(newErrors).length > 0) {
  //     setErrors(newErrors);
  //     return;
  //   }
  //   try {
  //     if (axios.defaults.baseURL === "https://nsgcrm.com") {
  //       await Promise.all([add_sender_data(), closeLead(), Webhook()]);
  //     }
  //     const order = JSON.parse(localStorage.getItem("order")) || {};
  //     order.customer_email = email;
  //     order.card_details = { name, title: "" };
  //     localStorage.setItem("order", JSON.stringify(order));
  //     setShowDepositModal(true);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  return (
    <div className="create-card-page">
      {/* STEP HEADER */}
      <div className="select-header">
        <div className="progress-card">
          <span className="progress-card-title">
            Create Card (60sec) ⭐ 4.3/5
          </span>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─── STACKED CARD PREVIEW ─────────────────────────── */}
      <div className="card-stack-wrapper">
        {/* BACK CARD — static + NFC chip */}
        <div className="metal-card card-back-static">
  <div className="nfc-chip">
    <img src={NFC_IMG} alt="NFC" />
  </div>
</div>

<div className="metal-card card-front-dynamic">
  <div className="nsg-center-logo">
    <img src={NSG_LOGO} alt="NSG" />
  </div>
</div>
      </div>
      {/* ─────────────────────────────────────────────────── */}

      {/* FORM */}
      <div className="create-form-section">
        <h2>Create Your Card</h2>
        <p>Add your details below to create your card</p>

        <div className="create-form-group floating">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
            placeholder=" "
            required
          />
          <label>First & Last Name</label>
          {errors.name && <span className="error">{errors.name}</span>}
        </div>

        <div className="create-form-group floating">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
            }}
            placeholder=" "
            required
          />
          <label>Email ID</label>
          {errors.email && <span className="error">{errors.email}</span>}
        </div>
        <p className="email-note">
          Your email will be used to create your account.
        </p>
{/* 
        <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
          <button
            className="create-primary-btn reserve-btn"
            onClick={handleReserveNow}
          >
            Reserve my card
          </button>
          <button className="create-primary-btn" onClick={handleContinue}>
            Add to cart
          </button>
        </div> */}
        <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
  <button className="create-primary-btn" onClick={handleContinue}>
    Add to cart
  </button>
</div>
        <div className="security_card">
          <img
            src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/24b56d4d439146fbbdf6284bf56474de.webp"
            alt="shield"
          />
          <span className="grn">Design Services Included</span>
        </div>
        <p className="trustpilot">Free Shipping Included | 4.3/5 Trustpilot</p>
      </div>

      <Footer />
      {/* {showDepositModal && (
        <DepositModal
          onClose={() => setShowDepositModal(false)}
          onCheckout={handleDepositCheckout}
        />
      )} */}
    </div>
  );
};

export default CreateYourCard;
