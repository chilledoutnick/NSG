import React, { useState, useEffect, useRef } from "react";
import "./ChhoseYourCard.scss";
import { useNavigate } from "react-router-dom";

import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import FAQ from "../faQ/faq";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import Footer from "../footerNew";
import CompareTable from "../CompareTable/CompareTable";

const logo =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/915d14d99c1b4a27a5f03047e2213333.webp";

const cardGallery39 = [
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/edbf1c01f78f4e98a035cf44e4dba3ed.webp",
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/4285b54982c24e4cb266c0202e194676.webp",
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/0ebf4ece57fd4833826fc59ac7e073c3.webp",
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/4bc5f82076f04d0288758144b69236ea.webp",
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/0b6b01f1b1134a97b336a69fe400494e.webp",
];

const cardGallery79 = [

  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/d13d0d667b1543809910660a3c367f97.webp",
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/db42b2d89c4b4413a25ba72119a63f80.webp",
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/94a0191bbfe749b2971ae1e62fdde3eb.webp",
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/6a7fa129d8e04272a11b8af730d12251.webp",
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/3868c8027a7f4cda8b14d3e8392ecb43.webp",
];

const cardGallery99 = [
 
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/96685a100c9148c080b0985d7766a167.webp",
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/4cc1dfa9dd66440b96fae6cab5c4e52d.webp",
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/7e4833a7ff45478eac596eef3a73f0c3.webp",
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/86820242f55346318172344242404ae8.webp",
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/0893371d67cf40e0927c0d6ad354b9bd.webp",
];

const CARD_PLANS = {
  metal39: {
    key: "metal39",
    name: "Everyday matte",
    subtitle: "(NSG branded)",
    originalPrice: null,
    discountedPrice: 39,
    thumbnail:
      "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/0269ab04a13e4b17bd08cb1488d165dc.webp",
    badge: null,
    details: [
      "Front: NSG-branded black plastic card ",
      "Back: QR code + NFC tap for instant sharing",
    ],
    gallery: cardGallery39,
  },
  metal79: {
    key: "metal79",
    name: "Metal classic",
    subtitle: "(without logo)",
    originalPrice: 79,
    discountedPrice: 59,
    thumbnail:
      "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/eff1c2c3681a4cd59e8a08f314ef4321.webp",
    badge: "MOST POPULAR",
    details: [
      "Front: Custom-engraved (name & title)",
      "Back: QR code + NFC tap for instant sharing",
    ],
    gallery: cardGallery79,
  },
  metal99: {
    key: "metal99",
    name: "Metal signature",
    subtitle: "(with logo)",
    originalPrice: 99,
    discountedPrice: 74,
    badge: null,
    thumbnail:
      "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/4f6a1fa20c8c469697a0193f38242df5.webp",
    details: [
      "Front:  Custom-engraved (name, title & logo)",
      "Back: QR code + NFC tap for instant sharing",
    ],
    gallery: cardGallery99,
  },
};

const reviewsData = [
  {
    name: "Luiza Mestoewa",
    title: "US • Reviewer",
    review:
      "Sleek metal cards with great customization. Makes networking simple and professional. Excellent team support.",
    rating: 5,
  },
  {
    name: "Bennett Associates",
    title: "US • Reviewer",
    review:
      "Delivered in just two days without compromising quality. Professional and reliable service.",
    rating: 5,
  },
  {
    name: "Raja Hundal",
    title: "US • 4 reviews",
    review:
      "Great app for managing networking. Keeps everything organized in one place.",
    rating: 5,
  },
  {
    name: "Consumer US",
    title: "US • Reviewer",
    review: "Top-tier service. The team goes the extra mile for customers.",
    rating: 5,
  },
  {
    name: "Miguel Serrell",
    title: "US • Reviewer",
    review:
      "Innovative digital business card with NFC and QR sharing. Modern networking solution.",
    rating: 5,
  },
  {
    name: "Arnav Bhagawati",
    title: "US • Reviewer",
    review: "Professional and easy to update. Would love more design options.",
    rating: 4,
  },
  {
    name: "Piyush IN",
    title: "IN • Reviewer",
    review:
      "Quick responses and great support. Delivered on time with excellent service.",
    rating: 5,
  },
  {
    name: "Shekinah Al-Hatimy",
    title: "Blood Moon Empire",
    review: "I love using this product!",
    rating: 5,
  },
  {
    name: "Fabricio Paul Welch",
    title: "Founder & CEO at HireProsOnly",
    review:
      "NSG Business card empowers professionals worldwide, streamlining connections and boosting productivity.",
    rating: 5,
  },
  {
    name: "Abubakar A Maina",
    title: "Maina home tire service",
    review:
      "Very good company to start your business card with them. Very loyal and respectful and willing to help you as much as possible.",
    rating: 5,
  },
  {
    name: "JB Fetzer",
    title: "Fetzer & Associates",
    review: "One of the most professional resources available.",
    rating: 4,
  },
  {
    name: "Olivia Carter",
    title: "Marketing Director • Toronto",
    review:
      "Our team switched to these NFC cards and it instantly upgraded our brand presence at events.",
    rating: 5,
  },
  {
    name: "Jason Miller",
    title: "Real Estate Broker • Dallas",
    review:
      "Clients love how fast they can save my contact. Way better than paper cards.",
    rating: 5,
  },
  {
    name: "Sophia Nguyen",
    title: "Startup Founder • Vancouver",
    review:
      "Clean design, easy setup, and very professional look. Highly recommend.",
    rating: 5,
  },
];

const CREATION_STEPS = [
  {
    icon: "upload",
    title: "Upload your information",
    desc: "Submit your card details, chosen finish, and any custom logo or designs you'd like engraved.",
  },
  {
    icon: "palette",
    title: "Receive card mockup",
    desc: "Our expert designers will create a digital mockup of your card within 2 business days.",
  },
  {
    icon: "edit",
    title: "Refine design",
    desc: "Review your mockup and request any changes.",
  },
  {
    icon: "check",
    title: "Approve for production",
    desc: "Once approved, we begin the precision laser engraving process and ship your new metal card.",
  },
];

const ChooseYourCard = () => {
  const [selected, setSelected] = useState("metal79");
  const [activeImage, setActiveImage] = useState(0);
  const navigate = useNavigate();
  const [openReviews, setOpenReviews] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [openStep, setOpenStep] = useState(null);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");

  const currentPlan = CARD_PLANS[selected];
  const currentGallery = currentPlan.gallery;

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

  const goToFaq = (index) => {
    setActiveFaq(index);
    setMenuOpen(false);
    setTimeout(() => {
      document
        .getElementById("faq-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    setActiveImage(0);
  }, [selected]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((prev) =>
        prev === currentGallery.length - 1 ? 0 : prev + 1,
      );
    }, 12000);
    return () => clearInterval(interval);
  }, [currentGallery.length]);



  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    setLogoFile(file);
  };

  const handlePersonalize = () => {
    const order = JSON.parse(localStorage.getItem("order")) || {};
    order.metal_card = selected;
    order.metal_price = currentPlan.discountedPrice;
    order.original_price = currentPlan.originalPrice;
    localStorage.setItem("order", JSON.stringify(order));

    if (selected === "metal39") {
      navigate("/create-your-card");
    } else {
      navigate("/personalize-card");
    }
  };

  const prevImage = () =>
    setActiveImage((prev) =>
      prev === 0 ? currentGallery.length - 1 : prev - 1,
    );
  const nextImage = () =>
    setActiveImage((prev) =>
      prev === currentGallery.length - 1 ? 0 : prev + 1,
    );

  const handleContinue = () => {
    const order = JSON.parse(localStorage.getItem("order")) || {};

    order.card_type = selected;
    order.card_price = currentPlan.discountedPrice;
    order.original_price = currentPlan.originalPrice;
    order.card_name = currentPlan.name;
    order.name = name;
    order.title = title;
    order.logo = logoFile ? logoFile.name : null;

    localStorage.setItem("order", JSON.stringify(order));

    navigate("/shipping-method");
  };

  return (
    <div className="select-card-page">
      {/* ── Desktop Nav ── */}
      <div className="nav">
        <div className="logo">
          <img src={logo} alt="NSG" />
        </div>
        <button
          className="signbtn"
          onClick={() => (window.location.href = "/signup")}
        >
          SignIn
        </button>
      </div>

      {/* ── Mobile Nav ── */}
      <div className="syc-nav">
        <div className="syc-logo">
          <img src={logo} alt="logo" />
        </div>
        <button
          className={`syc-hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {menuOpen && (
        <div className="syc-dropdown">
          <button onClick={() => goToFaq(0)}>How to Use</button>
          <button onClick={() => goToFaq(1)}>Package</button>
          <button onClick={() => goToFaq(5)}>Lost / Damage Coverage</button>
        </div>
      )}

      {/* ── Carousel ── */}
      <div className="card-preview">
        <div className="carousel">
          <button className="carousel-arrow left" onClick={prevImage}>
            <KeyboardArrowLeft />
          </button>

          <div className="carousel-image">
            <img src={currentGallery[activeImage]} alt={currentPlan.name} />
          </div>

          <button className="carousel-arrow right" onClick={nextImage}>
            <KeyboardArrowRight />
          </button>
        </div>

        <div className="carousel-dots">
          {currentGallery.map((_, i) => (
            <span
              key={i}
              className={`dot${activeImage === i ? " active" : ""}`}
              onClick={() => setActiveImage(i)}
            />
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="card-width">
        <div className="card-content">
          <h2>Smart Business Cards</h2>

          {/* Rating */}
          <div
            className="rating clickable"
            onClick={() => setOpenReviews(true)}
          >
            <div className="stars">
              <StarIcon />
              <StarIcon />
              <StarIcon />
              <StarIcon />
              <StarHalfIcon />
            </div>
            <div className="rating-text">
              <span className="score">4.8</span>
              <span className="divider">|</span>
              <span className="reviews">142 Reviews</span>
            </div>
          </div>

          {/* ── Horizontal card selector row ── */}
          <div className="card-selector-row">
            {Object.values(CARD_PLANS).map((plan) => (
              <div
                key={plan.key}
                className={`card-selector-item${selected === plan.key ? " active" : ""}`}
                onClick={() => setSelected(plan.key)}
              >
                {/* Badge: "MOST POPULAR" strip */}
                {plan.badge && (
                  <div className="selector-badge">{plan.badge}</div>
                )}

                {/* Thumbnail image */}
                <div className="selector-thumb">
                  <img src={plan.thumbnail} alt={plan.name} />
                </div>

                {/* Name + subtitle + price */}
                <div className="selector-info">
                  <span className="selector-name">{plan.name}</span>
                  {/* FIX: subtitle added — "(plastic card)" / "(without logo)" / "(with logo)" */}
                  <span className="selector-subtitle">{plan.subtitle}</span>

                  <div className="selector-price">
                    {plan.originalPrice && (
                      <span className="selector-old">
                        ${plan.originalPrice}
                      </span>
                    )}
                    <span className="selector-new">
                      ${plan.discountedPrice}
                    </span>
                  </div>

                  {plan.originalPrice && (
                    <span className="selector-discount">25% OFF</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="limited-card">
            Limited <strong>cards left</strong> at this price!
          </p>

          {/* ── Selected card details ── */}
          <div className="card-details-section">
            {/* FIX: title is now just "Details" not "{name} details" */}
            <h3 className="card-details-title">Details</h3>
            <ul className="card-details-list">
              {currentPlan.details.map((detail, i) => (
                <li key={i}>{detail}</li>
              ))}
            </ul>
          </div>

          {/* ── Personalization Form ── */}
          {selected !== "metal39" && (
            <div className="card-personalize-form">
              <input
                type="text"
                placeholder="First & Last Name"
                className="card-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                type="text"
                placeholder="Title & company"
                className="card-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              {selected === "metal99" && (
                <>
                  {!logoFile ? (
                    <label className="upload-box">
                      Upload your logo here
                      <FileUploadOutlinedIcon className="upload-icon" />
                      <input type="file" hidden onChange={handleLogoUpload} />
                    </label>
                  ) : (
                    <div className="upload-success">
                      <span className="file-name">{logoFile.name} ✓</span>

                      <label className="replace-logo">
                        Replace logo
                        <FileUploadOutlinedIcon className="upload-icon" />
                        <input type="file" hidden onChange={handleLogoUpload} />
                      </label>
                    </div>
                  )}
                </>
              )}

              <p className="form-note">
                Our design team will send you a polished mockup by email within
                2 business days so you can request any changes.
              </p>
            </div>
          )}
          {/* CTA */}
          <div className="cta-fixed">
            <button className="primaryy-btn" onClick={handleContinue}>
              Add to Cart
            </button>
          </div>

          {/* Security */}
          <section className="security">
            <div className="security__bottom">
              <div className="Security__item">
                {/* <span className="black">Trusted by 2k+ Founders</span> | */}
                <span className="black">Free shipping included</span>
              </div>
            </div>
            <div className="security__bottom">
              <div className="security__item">
                <img
                  src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/f668392c12824d9783eed1bbae737625.webp"
                  alt="ssl"
                />
                <span className="prpl">SSL secure checkout</span>
              </div>
              <div className="security__item">
                <img
                  src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/24b56d4d439146fbbdf6284bf56474de.webp"
                  alt="shield"
                />
                <span className="grn">Loss/Damage Coverage</span>
              </div>
            </div>
          </section>

          {/* Pro section */}
          <section className="pro-section">
            <h2>
              Every Card Includes
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
                  desc: "Add meeting notes and set reminders for follow‑ups.",
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

          <section className="hear-section">
            <h2 className="hear-title">Hear it from our Users</h2>
            <p className="hear-subtitle">
              Trusted by hundreds of founder, marketing pros, consultants, and
              business owners
            </p>

            <div className="hear-card">
              <div className="hear-stars">
                {[...Array(Math.floor(reviewsData[reviewIndex].rating))].map(
                  (_, i) => (
                    <StarIcon key={i} />
                  ),
                )}
                {reviewsData[reviewIndex].rating % 1 !== 0 && <StarHalfIcon />}
              </div>

              <p className="hear-review">{reviewsData[reviewIndex].review}</p>

              <div className="hear-user">
                <div className="hear-avatar">
                  {reviewsData[reviewIndex].name.charAt(0).toUpperCase()}
                </div>
                <div className="hear-user-info">
                  <h4 className="hear-name">{reviewsData[reviewIndex].name}</h4>
                  <span className="hear-role">
                    {reviewsData[reviewIndex].title}
                  </span>
                </div>
              </div>
            </div>

            <div className="hear-arrows">
              <button
                className="hear-arrow"
                onClick={() =>
                  setReviewIndex((prev) =>
                    prev === 0 ? reviewsData.length - 1 : prev - 1,
                  )
                }
              >
                <KeyboardArrowLeft />
              </button>
              <button
                className="hear-arrow"
                onClick={() =>
                  setReviewIndex((prev) =>
                    prev === reviewsData.length - 1 ? 0 : prev + 1,
                  )
                }
              >
                <KeyboardArrowRight />
              </button>
            </div>
            <div className="video-section">
          <video
            ref={videoRef}
            className="video-player"
            muted
            loop
            playsInline
            // poster="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/675b5aa8de0e4a33a169d29c2c7c050a.webp"
          >
            {/* Replace this src with real video URL later */}
            <source src="https://storage.googleapis.com/nsg-db-storage-public/media/videos/Unlock_Seamless_Networking_with_NSG_Tech-_A_Revolutionary_Digital_Card_ExperienceIm_th.mp4" type="video/mp4" />
          
          </video>
        </div>
          </section>

          <section className="creation-section">
            <h3 className="creation-title">Your Card Creation Process</h3>

            <div className="creation-accordion">
              {CREATION_STEPS.map((step, i) => {
                const isOpen = openStep === i;
                const IconComponent =
                  step.icon === "upload"
                    ? UploadFileOutlinedIcon
                    : step.icon === "palette"
                      ? PaletteOutlinedIcon
                      : step.icon === "edit"
                        ? EditNoteOutlinedIcon
                        : TaskAltOutlinedIcon;

                return (
                  <div key={i} className="creation-step">
                    {/* Left: icon circle + vertical connecting line */}
                    <div className="creation-step-left">
                      <div
                        className={`creation-icon-circle${isOpen ? " active" : ""}`}
                      >
                        <IconComponent className="creation-icon-svg" />
                      </div>
                      {i < CREATION_STEPS.length - 1 && (
                        <div className="creation-connector" />
                      )}
                    </div>

                    {/* Right: clickable header + expanded desc */}
                    <div
                      className="creation-step-right"
                      onClick={() => setOpenStep(isOpen ? null : i)}
                    >
                      <div className="creation-step-header">
                        <span
                          className={`creation-step-title${isOpen ? " bold" : ""}`}
                        >
                          {step.title}
                        </span>
                        {isOpen ? (
                          <KeyboardArrowUpIcon className="creation-chevron" />
                        ) : (
                          <KeyboardArrowDownIcon className="creation-chevron" />
                        )}
                      </div>

                      {isOpen && (
                        <p className="creation-step-desc">{step.desc}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <CompareTable />

          <FAQ activeIndex={activeFaq} setActiveIndex={setActiveFaq} />
        </div>
      </div>

      {/* ── Reviews modal ── */}
      {openReviews && (
        <div className="review-modal">
          <div
            className="review-overlay"
            onClick={() => setOpenReviews(false)}
          />
          <div className="review-content">
            <button className="close-btn" onClick={() => setOpenReviews(false)}>
              ✕
            </button>
            <h2>Hear It From Our Users</h2>
            <div className="review-list">
              {reviewsData.map((item, i) => (
                <div key={i} className="review-card">
                  <div className="review-top">
                    <div className="user-info">
                      <h4>{item.name}</h4>
                      <span>{item.title}</span>
                      <div className="review-stars">
                        {[...Array(item.rating)].map((_, j) => (
                          <StarIcon key={j} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="review-text">{item.review}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ChooseYourCard;
