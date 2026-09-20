import React from "react";
import "./smartBusinessCard.scss";
import $ from "jquery";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { useState, useEffect } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import Footer from "./footerNew";

const logo =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/915d14d99c1b4a27a5f03047e2213333.webp";
const heroImg =
  // "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/306e31247db74948ad033937526d6b2e.webp";
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/4c5a715f2b394bd1989bd515263d347e.webp";

// "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/1a01237a7f774563829a9d4e5dea6dd6.webp";
const heroImg2 =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/306e31247db74948ad033937526d6b2e.webp";
// "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/4c5a715f2b394bd1989bd515263d347e.webp";

// "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/1a01237a7f774563829a9d4e5dea6dd6.webp";

const grp =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/8a4cb7c0441940449e2eed70469a9604.webp";

const step1 =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Frame_2018777086_syw2ie_png.webp";
const step2 =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/wafwafwafwawcw_png.webp";
const step3 =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/image_kgzhmr_png.webp";

const insight =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/fd21536ef56a4f5e8c8ddbf38d16dd12.webp";

const security =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/ICon_wfwf1_png.webp";
const privacy =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Icondwdw_png.webp";
const support =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Icon_wwf2_png.webp";

const images = [
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/image_342_png.webp",
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/image_3t3t45_png.webp",
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/imagewfwf_109_png.webp",
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/gwagwagw_png.webp",
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/image_wwag114_png.webp",
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/image_1svw11_png.webp",
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/imawfwge_115_png.webp",
];

const SmartBusinessCard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const stepsRef = useRef(null);
  const solutionsRef = useRef(null);
  const impactRef = useRef(null);

  const [marginAuto, setMarginAuto] = useState(0);
  const [activeTextIndex, setActiveTextIndex] = useState(0);

  const handleOrderClick = () => {
    navigate("/select-your-card");
  };

  useEffect(() => {
    $(document).ready(function () {
      let margin_left = $(".header_con_wrapper").css("margin-left");
      setMarginAuto(margin_left || 0);
    });
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTextIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  const rotatingTexts = [
    "Capture  100% of Contacts",
    "5X Faster Follow-Ups",
    "Save $45/mo",
    "2+ Hours Saved Weekly",
  ];

  const trustedLogos = [
    "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/ac2b2b3a70ab4749a8da89b98cede5b0.webp",
    "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/9ca1a1ab1cf941dca288e0084e8db77d.webp",
    "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/391f01690b9e435e9173df7eee69ec1a.webp",
    "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/2b4284e4adb843ccbbaf1cff39e9ef69.webp",
    "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/d70630fd6aaf49e6a845c9e4b2c470c9.webp",
  ];

  const interactionData = [
    {
      title: "100% ",
      tag: "Contact Capture",
      desc: "Capture all interactions directly in the built-in CRM using your digital business card, email signature, and booking system. ",
    },
    {
      title: "~ $45 ",
      tag: "Saved Per Month",
      desc: "Skip multiple subscriptions—NSG unifies business cards, CRM, and scheduling in one tool.",
    },
    {
      title: "1-3 hr",
      tag: "Per Week Saved",
      desc: "Consolidate all discussions, notes, and emails for each lead in NSG—no need for multiple tools",
    },
    {
      title: "5x",
      tag: "Faster Follow-Ups ",
      desc: "With group and personalized email options at your fingertips, you  follow-up at just the right time.",
    },
  ];

  const audienceData = [
    {
      title: "Small Business Owners & Service Providers",
      desc: "Who meet potential clients everywhere and need a simple way to capture them.",
    },
    {
      title: "Sales & Marketing Professionals",
      desc: "Who don’t have time for complex CRMs but can’t risk forgetting a lead.",
    },
    {
      title: "Consultants, Founders & Professionals",
      desc: "Who rely on relationships, referrals, and professional credibility.",
    },
    {
      title: "Anyone Who Meets Potential Clients",
      desc: "Networkers, event attendees, community builders and more.",
    },
  ];

  const scrollAudienceRight = () => {
    const card = document.querySelector(".audience_card");
    const gap = 0; // tumhare CSS me gap 0 hai
    const scrollAmount = card.offsetWidth + gap;

    document
      .getElementById("audience_slider")
      .scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const scrollAudienceLeft = () => {
    const card = document.querySelector(".audience_card");
    const gap = 0;
    const scrollAmount = card.offsetWidth + gap;

    document
      .getElementById("audience_slider")
      .scrollBy({ left: -scrollAmount, behavior: "smooth" });
  };

  const scrollRightt = () => {
    const card = document.querySelector(".maximize_interaction_item");
    const gap = 24;
    const scrollAmount = card.offsetWidth + gap;

    document
      .getElementById("maximize_interaction_item")
      .scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const scrollLeftt = () => {
    const card = document.querySelector(".maximize_interaction_item");
    const gap = 24;
    const scrollAmount = card.offsetWidth + gap;

    document
      .getElementById("maximize_interaction_item")
      .scrollBy({ left: -scrollAmount, behavior: "smooth" });
  };

  const scrollToSection = (ref) => {
    setMenuOpen(false); // mobile menu close
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="sbc">
      {/* NAVBAR */}
      <nav className="sbc__navbar">
        <div className="sbc__container">
          {/* LOGO */}
          <div className="sbc__logo">
            <img src={logo} alt="NSG" />
          </div>

          {/* DESKTOP MENU */}
          <div className="sbc__menu">
            <button onClick={() => scrollToSection(stepsRef)}>
              How it Works
            </button>
            <button onClick={() => scrollToSection(solutionsRef)}>
              Solutions
            </button>
            <button onClick={() => scrollToSection(impactRef)}>Impact</button>
          </div>

          {/* DESKTOP ACTIONS */}
          <div className="sbc__actions">
            <button className="signin" onClick={() => navigate("/signup")}>
              Sign in
            </button>
            <button className="order" onClick={handleOrderClick}>
              Select Your Card
            </button>
          </div>

          {/* MOBILE HAMBURGER */}
          <button
            className="sbc__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* MOBILE DROPDOWN */}
        <div className={`sbc__mobile-menu ${menuOpen ? "open" : ""}`}>
          <button onClick={() => scrollToSection(stepsRef)}>
            How it Works
          </button>
          <button onClick={() => scrollToSection(solutionsRef)}>
            Solutions
          </button>
          <button onClick={() => scrollToSection(impactRef)}>Impact</button>

          <div className="divider" />

          <button className="signin" onClick={() => navigate("/signup")}>
            Sign in
          </button>
          <button className="order" onClick={handleOrderClick}>
            Select Your Card
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="sbc__hero">
        <div className="sbc__hero-container">
          {/* Left Image */}
          <div className="sbc__hero-image">
            <picture>
              <source media="(min-width:768px)" srcSet={heroImg} />
              <img src={heroImg2} alt="Hero" />
            </picture>
          </div>

          {/* Right Content */}
          <div className="sbc__hero-content">
            {/*  */}
            <h1>
              Smart Card. <br /> Smarter Follow‑Up.
            </h1>

            <p>
              Premium laser-engraved metal NFC card that instantly saves
              contacts — never miss a follow‑up
            </p>
            <div className="hero-badges">
              <div className="hero-text-marquee">
                <div className="hero-text-track">
                  {[...rotatingTexts, ...rotatingTexts].map((text, i) => (
                    <span key={i} className="hero-text-item">
                      {text}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              className="hero-btn"
              onClick={() => navigate("/select-your-card")}
            >
              Select Your Card
            </button>

            <div className="sbc__hero-stats">
              <span className="avatars">
                <img
                  src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/82cfc541430f41f287edfd6633a9e00c.webp"
                  alt="users"
                />
              </span>
              <span className="stats-text">
                Used daily by <strong> 5K+ </strong> professionals
              </span>
            </div>
          </div>
        </div>

        <div className="trusted_company">
          <div className="trusted_company_con">
            {/* Rating */}
            <div className="trusted_company_rating">
              <div className="stars">
                <StarIcon />
                <StarIcon />
                <StarIcon />
                <StarIcon />
                <StarHalfIcon />
              </div>
              <span className="text">| Trusted by 250+ Companies</span>
            </div>

            <div className="logo-marquee">
              <div className="logo-track">
                {[...trustedLogos, ...trustedLogos].map((logo, index) => (
                  <div className="logo-item" key={index}>
                    <img src={logo} alt="trusted company" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="support">
        <img
          src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/0314f37c5ac9421d8738c52c1845b8b5.webp"
          alt=""
        />
        <img
          src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/c7c14e98728c4e938bbec9fd6e6963dc.webp"
          alt=""
        />
        <img
          src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/b17476f362f84ba7a2bb6faaba77afe6.webp"
          alt=""
        />
      </div>

      {/* STEPS SECTION */}
      <section className="sbc__steps" ref={stepsRef}>
        <div className="sbc__steps-container">
          <h2 className="sbc__steps-title">
            From Conversation To Follow-Up— In 3 Simple Steps
          </h2>

          {/* STEP 1 */}
          <div className="sbc__step">
            <div className="sbc__step-content">
              <span className="step-count">STEP 1</span>
              <h3>Share Your Details with Tap or QR Code</h3>
              <p>
                Instantly share your details (via NFC, QR) at meetings, events,
                calls, or online — no paper, no typing, no friction.
              </p>
            </div>

            <div className="sbc__step-image">
              <div className="img-placeholder">
                <img src={step1} alt="Step 1" />
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="sbc__step reverse">
            <div className="sbc__step-content">
              <span className="step-count">STEP 2</span>
              <h3>Every Contact Is Saved Automatically</h3>
              <p>
                The moment someone shares, their details are captured and
                organized — no manual entry, no delay.
              </p>
            </div>

            <div className="sbc__step-image">
              <div className="img-placeholder">
                <img src={step2} alt="Step 2" />
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="sbc__step">
            <div className="sbc__step-content">
              <span className="step-count">STEP 3</span>
              <h3>Always Know Who to Follow Up With</h3>
              <p>
                Set reminders and instantly send emails or book meetings to
                close more opportunities.
              </p>
            </div>

            <div className="sbc__step-image">
              <div className="img-placeholder">
                <img src={step3} alt="Step 3" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METAL CARD SECTION */}
      <section className="sbc__metal">
        <div className="sbc__metal-card">
          {/* LEFT CONTENT */}
          <div className="sbc__metal-content">
            <h2>The Metal Card Is Just The Beginning</h2>

            <p className="primary">
              Every time you share your card, NSG quietly organizes your
              contacts behind the scenes with notes, reminders, and follow-ups,
              to ensure nothing falls through the cracks.
            </p>

            <p className="secondary">
              NSG includes a lightweight CRM that works automatically. No
              setup. No learning curve.
            </p>

            <button
              className="metal-btn"
              onClick={() => navigate("/select-your-card")}
            >
              Select Your Card
            </button>

            <span className="metal-meta">
              Ships in 3 Days • Works with iOS and Android
            </span>
          </div>

          {/* RIGHT IMAGE */}
          <div className="sbc__metal-image">
            <picture>
              <source media="(min-width:768px)" srcSet={heroImg} />
              <img src={heroImg2} alt="Hero" />
            </picture>
          </div>
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section className="sbc__reviews">
        <div className="sbc__reviews-container">
          <h2>Hear it from our Users</h2>
          <p className="subtitle">
            Trusted by hundreds of small business owners, marketing pros,
            consultants, and founders
          </p>

          {/* REVIEWS GRID */}
          <div className="sbc__reviews-wrapper">
            <div className="sbc__reviews-track" id="reviewsTrack">
              <div className="review-card">
                <div className="stars">★★★★★</div>
                <p>
                  Earlier I used paper cards that people threw away. Now with
                  NSG’s metal card and profile page, people actually save my
                  details.
                </p>
                <div className="user">
                  <img src="https://i.pravatar.cc/40?img=12" alt="" />
                  <div>
                    <strong>Radrek Dan</strong>
                    <span>Sales Manager</span>
                  </div>
                </div>
              </div>

              <div className="review-card">
                <div className="stars">★★★★★</div>
                <p>
                  NSG didn’t just give me a premium metal card, it gave me a
                  smart digital identity. Sharing contact details is effortless
                  now.
                </p>
                <div className="user">
                  <img src="https://i.pravatar.cc/40?img=32" alt="" />
                  <div>
                    <strong>Cooper Allen</strong>
                    <span>Founder</span>
                  </div>
                </div>
              </div>

              <div className="review-card">
                <div className="stars">★★★★★</div>
                <p>
                  Clients are genuinely impressed when I tap the metal card. But
                  the real magic is the digital profile it opens — I never lose
                  a lead now..
                </p>
                <div className="user">
                  <img src="https://i.pravatar.cc/40?img=18" alt="" />
                  <div>
                    <strong>Sarah Miles</strong>
                    <span>Consultant</span>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM RIGHT NAV */}
            <div className="review-nav-bottom">
              <button
                onClick={() => {
                  document
                    .getElementById("reviewsTrack")
                    .scrollBy({ left: -window.innerWidth, behavior: "smooth" });
                }}
              >
                <KeyboardArrowLeftIcon />
              </button>

              <button
                onClick={() => {
                  document
                    .getElementById("reviewsTrack")
                    .scrollBy({ left: window.innerWidth, behavior: "smooth" });
                }}
              >
                <KeyboardArrowRightIcon />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* INSIGHT SECTION */}
      <section className="sbc__insight">
        <div className="sbc__insight-container">
          <div className="sbc__insight-media">
            <video
              src="https://drive.google.com/uc?export=download&id=18EpDdcc3i_xjNmKUazha9CF2roVghbju"
              autoPlay
              muted
              loop
              playsInline
              controls
            />
          </div>

          {/* <div className="sbc__insight-content">
            <p>
              NSG users report faster follow-ups, fewer missed connections,
              and more conversations turning into meetings.
            </p>
          </div> */}
        </div>
      </section>

      <div className="maximize_interaction_con" ref={solutionsRef}>
        <h2 style={{}}>
          Real results you can measure — see what <br />
          NSG customers achieve
        </h2>

        <div
          className="maximize_interaction_items"
          id="maximize_interaction_item"
        >
          {interactionData.map((item, index) => (
            <div className="maximize_interaction_item" key={index}>
              <h5>{item.title}</h5>
              <span>{item.tag}</span>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="maximize_interaction_nav">
          <button onClick={scrollLeftt}>
            <KeyboardArrowLeftIcon />
          </button>
          <button onClick={scrollRightt}>
            <KeyboardArrowRightIcon />
          </button>
        </div>
      </div>

      <section className="audience_section" ref={impactRef}>
        <div
          className="audience_header"
          style={{ paddingLeft: marginAuto, paddingRight: marginAuto }}
        >
          <h2>Built for People Who Can’t Afford to Lose a Lead</h2>
        </div>

        <div className="audience_cards" id="audience_slider">
          {audienceData.map((item, index) => (
            <div className="audience_card" key={index}>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="audience_nav">
          <button onClick={scrollAudienceLeft}>
            <KeyboardArrowLeftIcon />
          </button>
          <button onClick={scrollAudienceRight}>
            <KeyboardArrowRightIcon />
          </button>
        </div>
      </section>

      <section className="commitment">
        <div className="commitment__container">
          <div className="commitment__left">
            <h2>
              Commitments <br /> You Can Count On
            </h2>

            <p>
              At NSG, we prioritize your trust by ensuring top-tier data
              privacy and security to protect your information at all times. Our
              platform is designed with safeguards to keep your data safe and
              confidential. Plus, with our 24/7 support, help is always just a
              message away.
            </p>
          </div>

          <div className="commitment__list">
            <div className="commitment__item">
              <div className="commitment__icon">
                <img src={privacy} alt="privacy" />
              </div>
              <div>
                <h4>Data Privacy</h4>
                <p>
                  NSG is committed to user privacy and ensures your data
                  remains secure.
                </p>
              </div>
            </div>

            <div className="commitment__item">
              <div className="commitment__icon">
                <img src={security} alt="security" />
              </div>
              <div>
                <h4>Security</h4>
                <p>
                  We implement advanced security protocols to prevent
                  unauthorized access.
                </p>
              </div>
            </div>

            <div className="commitment__item">
              <div className="commitment__icon">
                <img src={support} alt="support" />
              </div>
              <div>
                <h4>24/7 Support</h4>
                <p>
                  NSG hand holds clients through each step of the journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />

      {/* <div className="lp-footer">
        <div className="lp-footer-card">
          <div className="lp-footer-top">
            <h3>Looking for NSG for your team?</h3>
            <p>
              Manage cards, branding, and follow-ups <br />
              across your organization.
            </p>

            <a
              href="/team-solutions"
              className="lp-footer-link"
            >
              Learn about Teams
            </a>
          </div>

          <div className="lp-footer-social">
            <a>
              <LinkedInIcon />
            </a>
            <a>
              <FacebookIcon />
            </a>
            <a>
              <InstagramIcon />
            </a>
          </div>

          <div className="lp-footer-logo">
            <img
              src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Logo_png.webp"
              alt="NSG"
            />
          </div>

          <div className="lp-footer-divider" />

          <p className="lp-footer-copy">
            Copyright © 2026 NSG. All rights reserved.
          </p>
        </div>
      </div> */}
    </div>
  );
};

export default SmartBusinessCard;
