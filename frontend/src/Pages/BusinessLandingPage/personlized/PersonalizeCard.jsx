import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "./PersonalizeCard.scss";
import Footerlp from "../footerlp/Footerlp.jsx";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import Footer from "../footerNew.jsx";
import FiberManualRecordOutlinedIcon from "@mui/icons-material/FiberManualRecordOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import DepositModal from "../Depositmodal/Depositmodal";

const logoL =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/915d14d99c1b4a27a5f03047e2213333.webp";

const CARD_LOGO_PLACEHOLDER =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/e9b365c1d4fc45ac89318dde49887c56.webp";

const NFC_IMG =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/471b97a8233943879ad2d4e93fdd8d51.webp";

const STRIPE_DEPOSIT_MAP = {
  metal39: " https://buy.stripe.com/bJe14mcBCc8N81t3BLeME1s",
  // metal39: " https://buy.stripe.com/test_bJebJ0fNO0q5epR8W5eME0g",
  // metal79: "https://buy.stripe.com/test_eVq00icBC1u95TlegpeME0h",
  metal79: "https://buy.stripe.com/6oUcN4bxy7Sx3Ld3BLeME1t",
  // metal99: "https://buy.stripe.com/test_aFa4gy9pq3Ch6XpgoxeME0i",
  metal99: "https://buy.stripe.com/6oU14meJKfkZ6Xp2xHeME1u",
};

const PersonalizeCard = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [logo, setLogo] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  // const [showDepositModal, setShowDepositModal] = useState(false);
  const [useDesigner, setUseDesigner] = useState(false);

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const checkEmailAPI = async (email) => {
    try {
      const res = await axios.post("/api/user/email_check/", { email });
      return res.data.email_exists;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Email check failed");
    }
  };

  const handleEmailBlur = async () => {
    if (!email || !isValidEmail(email)) return;
    try {
      const exists = await checkEmailAPI(email);
      if (exists) {
        setErrors((prev) => ({ ...prev, email: "Email already exists" }));
      }
    } catch (err) {
      setErrors((prev) => ({ ...prev, email: "Email verification failed" }));
    }
  };

  useEffect(() => {
    const order = JSON.parse(localStorage.getItem("order"));
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
    order.card_details = { ...order.card_details, name, title };
    order.customer_email = email;
    localStorage.setItem("order", JSON.stringify(order));
  }, [name, title, email]);



  const order = JSON.parse(localStorage.getItem("order")) || {};
  const plan = order.metal_card || "metal79";

  // sirf metal99 (Signature) mein logo, metal59 (Classic) mein nahi
  const hasLogo = plan === "metal99";
  // metal39 ke alawa sab mein name/title
  const hasNameTitle = plan !== "metal39";

  const trackedFields = [name.trim(), title.trim(), email.trim()];
  const completedFields = trackedFields.filter(Boolean).length;
  const progressPercent = Math.round((completedFields / 3) * 100);

  // const handleReserveNow = async () => {
  //   const newErrors = {};

  //   if (hasNameTitle && !name.trim()) newErrors.name = "Name is required";
  //   if (hasNameTitle && !title.trim()) newErrors.title = "Title is required";

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
  //     await saveSmartCard();
  //     await Promise.all([add_sender_data(), closeLead(), Webhook()]);

  //     const order = JSON.parse(localStorage.getItem("order")) || {};
  //     order.customer_email = email;
  //     order.card_details = { name, title };
  //     localStorage.setItem("order", JSON.stringify(order));

  //     setShowDepositModal(true);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  const saveSmartCard = async () => {
    const formData = new FormData();
    formData.append("email", email.trim());
    formData.append("designation", title.trim());
    formData.append("card_type", plan);
    if (logoFile) formData.append("logo", logoFile);
    try {
      return await axios.post("api/smart_card/save_smart_card/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (err) {
      const msg = err.response?.data?.message || "";
      if (msg.includes("logo") && msg.includes("Duplicate")) {
        showToast("Please upload your logo to continue.");
      } else {
        showToast(msg || "Something went wrong. Please try again.");
      }
      throw err;
    }
  };

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

  // const handleDepositCheckout = () => {
  //   const order = JSON.parse(localStorage.getItem("order")) || {};

  //   const selectedPlan = order.metal_card || "metal79";

  //   const checkoutUrl = STRIPE_DEPOSIT_MAP[selectedPlan];

  //   if (!checkoutUrl) {
  //     alert("Deposit payment not available.");
  //     return;
  //   }

  //   localStorage.setItem("order", JSON.stringify(order));

  //   // 🔥 email attach karo
  //   const finalUrl = email
  //     ? `${checkoutUrl}?prefilled_email=${encodeURIComponent(email)}`
  //     : checkoutUrl;

  //   window.location.href = finalUrl;
  // };

  const handleContinue = async () => {
    const newErrors = {};
    if (hasNameTitle && !name.trim()) newErrors.name = "Name is required";
    if (hasNameTitle && !title.trim()) newErrors.title = "Title is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      const emailExists = await checkEmailAPI(email);
      if (emailExists) {
        setErrors({ email: "Email already exists" });
        return;
      }
      await saveSmartCard();
      if (axios.defaults.baseURL === "https://nsgcrm.com") {
        await Promise.all([add_sender_data(), closeLead()]);
      }
      const updatedOrder = JSON.parse(localStorage.getItem("order")) || {};
      updatedOrder.customer_email = email;
      updatedOrder.card_details = { name, title, has_logo: !!logo };
      localStorage.setItem("order", JSON.stringify(updatedOrder));
      navigate("/shipping-method");
    } catch (err) {}
  };

  const handleChange = (field, value) => {
    if (field === "name") setName(value);
    if (field === "title") setTitle(value);
    if (field === "email") setEmail(value);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <>
      <div className="personalize-page">
        <div className="nav">
          <div className="logo">
            <img src={logoL} alt="" />
          </div>
          <div>
            <button
              className="signbtn"
              onClick={() =>
                (window.location.href = "/signup")
              }
            >
              SignIn
            </button>
          </div>
        </div>

        {/* STEP HEADER */}
        {/* <div className="select-header">
          <div className="step active">
            <span>Personalize Card</span>
            <div className="indicator"></div>
          </div>
          <div
            className="step"
            onClick={() => navigate("/shipping-method")}
            style={{ cursor: "pointer" }}
          >
            <span>Select Shipping</span>
            <div className="indicator"></div>
          </div>
        </div> */}

        {/* STEP HEADER — Progress Bar */}
        <div className="select-header">
          <div className="progress-card">
            <span className="progress-card-title">
              Personalize Card (60sec) ⭐ 4.3/5
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
          {/* BACK CARD — static + NFC (all plans) */}
          <div className="metal-card card-back-static">
            <div className="nfc-chip">
              <img src={NFC_IMG} alt="NFC" />
            </div>
          </div>

          {/* ── metal39: fully static, NSG centered logo ── */}
          {plan === "metal39" && (
            <div className="metal-card card-front-dynamic">
              <div className="nsg-center-logo">
                <img src={logoL} alt="NSG" />
                <span>NSG</span>
              </div>
            </div>
          )}

          {/* ── metal59 / metal79: name + title only, no logo ── */}
          {(plan === "metal59" || plan === "metal79") && (
            <div className="metal-card card-front-dynamic">
              <div className="card-text">
                <h3>{name || "Your Name"}</h3>
                <p>{title || "Title & company"}</p>
              </div>
            </div>
          )}

          {/* ── metal99 (Signature): name + title + logo ─────── */}
          {hasLogo && (
            <div className="metal-card card-front-dynamic">
              {!logo ? (
                <div className="logo-placeholder">
                  <img src={CARD_LOGO_PLACEHOLDER} alt="" />
                  <span>Your Logo</span>
                </div>
              ) : (
                <img src={logo} alt="logo" className="card-logo" />
              )}
              <div className="card-text">
                <h3>{name || "Your Name"}</h3>
                <p>{title || "Title & company"}</p>
              </div>
            </div>
          )}
        </div>
        {/* ─────────────────────────────────────────────────── */}

        {/* FORM */}
        <div className="card-width">
          <div className="form-section">
            <h2>Personalize Your Card</h2>
            <p className="form-subtitle">
              Add your details below to preview your card
            </p>

            {/* Name + Title — hidden for metal39 */}
            {hasNameTitle && (
              <>
                <div className="form-group floating">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    placeholder=" "
                    className={errors.name ? "error" : ""}
                  />
                  <label>First & Last Name</label>
                  {errors.name && (
                    <span className="error-text">{errors.name}</span>
                  )}
                </div>

                <div className="form-group floating">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                    placeholder=" "
                    className={errors.title ? "error" : ""}
                  />
                  <label>Title & company</label>
                  {errors.title && (
                    <span className="error-text">{errors.title}</span>
                  )}
                </div>
              </>
            )}

            <div className="form-group floating">
              <input
                type="email"
                value={email}
                onBlur={handleEmailBlur}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                placeholder=" "
                className={errors.email ? "error" : ""}
              />
              <label>Email ID</label>
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>
            <p className="email-note">
              Your email will be used to create your account.
            </p>

            {/* Logo Upload — only for metal74/79/99 */}
            {hasLogo && (
              <div className="logo-upload">
                <div
                  className={`upload-box ${errors.logo ? "error" : ""}`}
                  onClick={() => document.getElementById("logoInput").click()}
                >
                  <div className="upload-placeholder">
                    {!logo ? (
                      <>
                        <p>
                          {" "}
                          <FileUploadOutlinedIcon className="arw" />
                          Upload your logo here
                        </p>
                        <small>PNG, JPEG, or JPG</small>
                      </>
                    ) : (
                      <p>Change Logo</p>
                    )}
                  </div>
                  <input
                    id="logoInput"
                    type="file"
                    hidden
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setLogo(URL.createObjectURL(file));
                        setLogoFile(file);
                        setErrors((prev) => ({ ...prev, logo: "" }));
                      }
                    }}
                  />
                </div>
                {errors.logo && (
                  <span className="error-text">{errors.logo}</span>
                )}
                <p className="logo-info">
                  Logo upload is <strong> optional</strong>— we’ll collect the
                  final logo after your order is placed, and the logo engraving
                  color will match the name and title.
                </p>
              </div>
            )}

            <div className="cta-fixed">
              {/* ✅ Buttons alag wrapper me */}
              <div className="cta-buttons-row">
                <button className="primaryy-btn" onClick={handleContinue}>
                  Add to cart
                </button>
              </div>

              {/* ✅ Text alag wrapper me */}
              <div className="cta-info">
                <div className="design-services">
                  <img
                    src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/24b56d4d439146fbbdf6284bf56474de.webp"
                    alt=""
                  />
                  <span>Design Services Included</span>
                </div>

                <p className="trustpilot">
                  Free Shipping Included | 4.3/5 Trustpilot
                </p>
              </div>
            </div>

            {/* Pro section */}
            <section className="pro-section">
              <h2>
                Card Includes
                <br />
                NSG Pro
              </h2>
              <div className="limited-badge">
                Share your profile, capture contacts, and follow up — all in one
              </div>
              <div className="pro-list">
                {[
                  {
                    title: "Digital profile",
                    desc: "Stand out instantly and capture contacts effortlessly.",
                  },
                  {
                    title: "Notes & Reminder",
                    desc: "Add meeting notes and set reminders within contact management.",
                  },
                  {
                    title: "Follow-ups",
                    desc: "Send follow-ups to set meetings and close more deals",
                  },
                ].map((item, i) => (
                  <div className="pro-item" key={i}>
                    <div className="check">
                      <svg viewBox="0 0 24 24" width="22" height="22">
                        <path
                          fill="white"
                          d="M9 16.2l-3.5-3.5L4 14.2l5 5 12-12-1.5-1.5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* <Footer /> */}
      </div>

      {toast && (
        <div
          style={{
            position: "fixed",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            background: toast.type === "error" ? "#e53e3e" : "#38a169",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "8px",
            fontWeight: 500,
            zIndex: 9999,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            whiteSpace: "nowrap",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* {showDepositModal && (
        <DepositModal
          onClose={() => setShowDepositModal(false)}
          onCheckout={handleDepositCheckout}
        />
      )} */}
    </>
  );
};

export default PersonalizeCard;
